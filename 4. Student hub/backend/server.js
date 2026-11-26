import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const allowedKeys = new Set([
  "tasks",
  "expenses",
  "exams",
  "attendance",
  "cgpa",
  "pomodoro",
  "settings",
  "profile",
]);
const otpChallenges = new Map();
const otpLastSent = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const PROFILE_PHOTO_MAX_BYTES = 500 * 1024;

if (!jwtSecret) throw new Error("JWT_SECRET is required in the .env file.");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || "student_utility_hub",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(cors({ origin: process.env.CLIENT_ORIGIN || false }));
app.use(express.json({ limit: "1mb" }));

const userResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});
const createToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      tokenVersion: Number(user.token_version) || 0,
    },
    jwtSecret,
    {
    expiresIn: "7d",
    },
  );

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Sign in is required." });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const [rows] = await db.execute(
      "SELECT token_version FROM users WHERE id = ?",
      [decoded.userId],
    );
    if (!rows[0] || Number(rows[0].token_version) !== Number(decoded.tokenVersion || 0))
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    req.auth = decoded;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
    return next(error);
  }
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  if (
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate())
  ) age--;
  return age;
}

function isValidDateOfBirth(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= new Date();
}

function validatePhotoData(photoData) {
  if (photoData == null || photoData === "") return null;
  if (typeof photoData !== "string") throw new Error("Choose a PNG, JPEG, or WebP profile picture.");
  const match = photoData.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) throw new Error("Choose a PNG, JPEG, or WebP profile picture.");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > PROFILE_PHOTO_MAX_BYTES || bytes.toString("base64") !== match[2])
    throw new Error("Profile pictures must be smaller than 500 KB.");
  const type = match[1];
  const validSignature = type === "png"
    ? bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : type === "jpeg"
      ? bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!validSignature) throw new Error("The selected file is not a valid image.");
  return photoData;
}

async function readProfile(userId) {
  const [[users], [rows]] = await Promise.all([
    db.execute("SELECT id, name, email FROM users WHERE id = ?", [userId]),
    db.execute(
      "SELECT data_value FROM user_data WHERE user_id = ? AND data_key = 'profile'",
      [userId],
    ),
  ]);
  if (!users[0]) return null;
  let saved = rows[0]?.data_value || {};
  if (typeof saved === "string") saved = JSON.parse(saved);
  return {
    name: users[0].name,
    email: users[0].email,
    age: calculateAge(saved.dateOfBirth),
    dateOfBirth: saved.dateOfBirth || "",
    phone: saved.phone || "",
    phoneVerified: Boolean(saved.phoneVerified),
    school: saved.school || "",
    program: saved.program || "",
    studyYear: saved.studyYear || "",
    photoData: saved.photoData || "",
  };
}

function otpKey(userId, purpose) {
  return `${userId}:${purpose}`;
}

function otpDigest(key, code) {
  return createHmac("sha256", jwtSecret).update(`${key}:${code}`).digest();
}

async function sendEmailCode(email, code) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    throw new Error("Email verification is not configured on this server.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Your Student Utility Hub verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      html: `<p>Your Student Utility Hub verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:5px">${code}</p><p>It expires in 10 minutes. If you did not request this code, you can ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error("The verification email could not be sent.");
}

async function sendPhoneCode(phone, code) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM_NUMBER: from } = process.env;
  if (!sid || !token || !from)
    throw new Error("Phone verification is not configured on this server.");
  if (!/^AC[0-9a-f]{32}$/i.test(sid)) throw new Error("Phone verification is not configured on this server.");
  const form = new URLSearchParams({
    To: phone,
    From: from,
    Body: `Your Student Utility Hub verification code is ${code}. It expires in 10 minutes.`,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!response.ok) throw new Error("The verification text could not be sent.");
}

async function issueOtp(userId, purpose, destination, deliveryChannel) {
  const key = otpKey(userId, purpose),
    lastSentAt = otpLastSent.get(key) || 0;
  if (Date.now() - lastSentAt < OTP_RESEND_MS)
    throw new Error("Wait one minute before requesting another code.");
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  if (deliveryChannel === "phone") await sendPhoneCode(destination, code);
  else await sendEmailCode(destination, code);
  otpChallenges.set(key, {
    digest: otpDigest(key, code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    destination,
  });
  otpLastSent.set(key, Date.now());
}

function consumeOtp(userId, purpose, code) {
  const key = otpKey(userId, purpose), challenge = otpChallenges.get(key);
  if (!challenge || challenge.expiresAt <= Date.now()) {
    otpChallenges.delete(key);
    return false;
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    otpChallenges.delete(key);
    return false;
  }
  challenge.attempts++;
  const submittedDigest = otpDigest(key, String(code || ""));
  if (!timingSafeEqual(challenge.digest, submittedDigest)) return false;
  otpChallenges.delete(key);
  otpLastSent.delete(key);
  return challenge;
}

app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "database unavailable" });
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    if (!name || !email || password.length < 4)
      return res
        .status(400)
        .json({
          message:
            "Enter a name, valid email, and password of at least 4 characters.",
        });
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    );
    const user = { id: result.insertId, name, email };
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({
          message: "An account with that email already exists. Please sign in.",
        });
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    const [rows] = await db.execute(
      "SELECT id, name, email, password_hash, token_version FROM users WHERE email = ?",
      [email],
    );
    const account = rows[0];
    if (!account || !(await bcrypt.compare(password, account.password_hash)))
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    const user = userResponse(account);
    res.json({ user, token: createToken(account) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/profile", authenticate, async (req, res, next) => {
  try {
    const profile = await readProfile(req.auth.userId);
    if (!profile) return res.status(404).json({ message: "User not found." });
    res.json({ profile });
  } catch (error) { next(error); }
});

app.put("/api/profile", authenticate, async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const dateOfBirth = String(req.body.dateOfBirth || "");
    if (!name || name.length > 50) return res.status(400).json({ message: "Name must be between 1 and 50 characters." });
    if (!isValidDateOfBirth(dateOfBirth)) return res.status(400).json({ message: "Enter a valid date of birth." });
    const [existingRows] = await db.execute("SELECT data_value FROM user_data WHERE user_id = ? AND data_key = 'profile'", [req.auth.userId]);
    let saved = existingRows[0]?.data_value || {};
    if (typeof saved === "string") saved = JSON.parse(saved);
    let photoData;
    try { photoData = req.body.photoData === undefined ? (saved.photoData || "") : (validatePhotoData(req.body.photoData) || ""); }
    catch (error) { return res.status(400).json({ message: error.message }); }
    const profile = {
      dateOfBirth,
      phone: saved.phone || "",
      phoneVerified: Boolean(saved.phoneVerified),
      school: String(req.body.school || "").trim().slice(0, 100),
      program: String(req.body.program || "").trim().slice(0, 100),
      studyYear: String(req.body.studyYear || "").trim().slice(0, 40),
      photoData,
    };
    await db.execute("UPDATE users SET name = ? WHERE id = ?", [name, req.auth.userId]);
    await db.execute(`INSERT INTO user_data (user_id, data_key, data_value) VALUES (?, 'profile', ?) ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)`, [req.auth.userId, JSON.stringify(profile)]);
    res.json({ profile: { name, email: req.auth.email, age: calculateAge(dateOfBirth), ...profile } });
  } catch (error) { next(error); }
});

app.post("/api/profile/phone/request-verification", authenticate, async (req, res, next) => {
  try {
    const password = String(req.body.password || ""), phone = String(req.body.phone || "").trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({ message: "Enter a phone number in international format, such as +14155552671." });
    const [rows] = await db.execute("SELECT password_hash FROM users WHERE id = ?", [req.auth.userId]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ message: "Your current password is incorrect." });
    await issueOtp(req.auth.userId, "phone", phone, "phone");
    res.json({ message: "Verification code sent by text." });
  } catch (error) {
    if (/not configured/.test(error.message)) return res.status(503).json({ message: error.message });
    if (/Wait one minute/.test(error.message)) return res.status(429).json({ message: error.message });
    next(error);
  }
});

app.post("/api/profile/phone/verify", authenticate, async (req, res, next) => {
  try {
    const challenge = consumeOtp(req.auth.userId, "phone", req.body.code);
    if (!challenge) return res.status(400).json({ message: "That code is invalid or expired. Request a new one." });
    const [rows] = await db.execute("SELECT data_value FROM user_data WHERE user_id = ? AND data_key = 'profile'", [req.auth.userId]);
    let profile = rows[0]?.data_value || {};
    if (typeof profile === "string") profile = JSON.parse(profile);
    profile.phone = challenge.destination;
    profile.phoneVerified = true;
    await db.execute(`INSERT INTO user_data (user_id, data_key, data_value) VALUES (?, 'profile', ?) ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)`, [req.auth.userId, JSON.stringify(profile)]);
    res.json({ message: "Phone number verified.", phone: profile.phone });
  } catch (error) { next(error); }
});

app.post("/api/profile/otp/request", authenticate, async (req, res, next) => {
  try {
    const channel = req.body.channel === "phone" ? "phone" : "email";
    const password = String(req.body.password || "");
    const [users] = await db.execute("SELECT email, password_hash FROM users WHERE id = ?", [req.auth.userId]);
    if (!users[0] || !(await bcrypt.compare(password, users[0].password_hash))) return res.status(401).json({ message: "Your current password is incorrect." });
    let destination = users[0].email;
    if (channel === "phone") {
      const profile = await readProfile(req.auth.userId);
      if (!profile?.phone || !profile.phoneVerified) return res.status(400).json({ message: "Verify a phone number before using it for password changes." });
      destination = profile.phone;
    }
    await issueOtp(req.auth.userId, "password", destination, channel);
    res.json({ message: `Verification code sent to your ${channel === "phone" ? "verified phone" : "account email"}.` });
  } catch (error) {
    if (/not configured/.test(error.message)) return res.status(503).json({ message: error.message });
    if (/Wait one minute/.test(error.message)) return res.status(429).json({ message: error.message });
    next(error);
  }
});

app.post("/api/profile/password/change", authenticate, async (req, res, next) => {
  try {
    const newPassword = String(req.body.newPassword || ""), code = String(req.body.code || "");
    if (newPassword.length < 12) return res.status(400).json({ message: "Use a password with at least 12 characters." });
    const challenge = consumeOtp(req.auth.userId, "password", code);
    if (!challenge) return res.status(400).json({ message: "That code is invalid or expired. Request a new one." });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.execute("UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?", [passwordHash, req.auth.userId]);
    const [rows] = await db.execute("SELECT id, name, email, token_version FROM users WHERE id = ?", [req.auth.userId]);
    const user = userResponse(rows[0]);
    res.json({ message: "Password changed. Other signed-in sessions have been ended.", user, token: createToken(rows[0]) });
  } catch (error) { next(error); }
});

app.get("/api/auth/me", authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.auth.userId],
    );
    if (!rows[0]) return res.status(404).json({ message: "User not found." });
    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.get("/api/data", authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT data_key, data_value FROM user_data WHERE user_id = ?",
      [req.auth.userId],
    );
    res.json({
      data: Object.fromEntries(
        rows.map((row) => [row.data_key, row.data_value]),
      ),
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/data/:key", authenticate, async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!allowedKeys.has(key))
      return res.status(400).json({ message: "Unsupported data type." });
    if (req.body.data === undefined)
      return res.status(400).json({ message: "Data is required." });
    await db.execute(
      `INSERT INTO user_data (user_id, data_key, data_value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)`,
      [req.auth.userId, key, JSON.stringify(req.body.data)],
    );
    res.json({ message: "Saved." });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/data/:key", authenticate, async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!allowedKeys.has(key))
      return res.status(400).json({ message: "Unsupported data type." });
    await db.execute(
      "DELETE FROM user_data WHERE user_id = ? AND data_key = ?",
      [req.auth.userId, key],
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

async function start() {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'token_version'");
  if (!columns.length) await db.query("ALTER TABLE users ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0");
  app.listen(port, () => console.log(`Student Utility Hub API running on http://localhost:${port}`));
}
start().catch((error) => { console.error("Unable to start Student Utility Hub API:", error.message); process.exitCode = 1; });
