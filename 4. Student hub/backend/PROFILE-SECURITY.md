# Profile and verification setup

The profile page reads and saves profile details through authenticated API routes. Password changes require the current password when requesting a one-time code, a valid code, and a new password of at least 12 characters. Codes expire after 10 minutes, have a one-minute resend cooldown, and allow at most five attempts. Password changes increment the account token version, ending other sessions.

Copy `.env.example` to `.env` and keep `.env` private. Email codes use the Resend API; configure `RESEND_API_KEY` and a sender address `EMAIL_FROM` verified with Resend. Phone verification is optional and uses Twilio; set all three `TWILIO_*` values to enable it. Without provider configuration the API returns an explicit setup error and does not claim that a code was sent. Do not commit provider credentials.

Run the backend with its existing start command. On startup it adds the `token_version` column to an older `users` table if needed; fresh databases also get it from `schema.sql`.

One-time code challenges are stored as keyed digests in server memory, not in browser storage. This means a code becomes invalid if the API process restarts and this implementation is intended for a single API instance. For a multi-instance deployment, use a shared expiring store and configure HTTPS, strict production CORS origins, provider limits, monitoring, and backups. No application can promise complete protection from every attack.
