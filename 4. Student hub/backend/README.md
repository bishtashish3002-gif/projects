# Student Utility Hub backend

This folder contains the Node.js API and MySQL database schema for Student Utility Hub.

## 1. Create the database

Open MySQL Workbench, open `schema.sql`, and run the complete file. It creates the `student_utility_hub` database and its tables.

## 2. Configure the server

Copy `.env.example` to a new file named `.env`. Update `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` with your own values. Keep `.env` private.

## 3. Install and start the API

Open a terminal in this `backend` folder and run:

```powershell
npm install
npm start
```

The API will run at `http://localhost:3000`.

## 4. Open the website with a local server

Do not open the HTML file by double-clicking it. Start it with a local development server such as Live Server in VS Code. Its address should match `CLIENT_ORIGIN` in `.env` (normally `http://127.0.0.1:5500`).

## What is stored

The database stores accounts, hashed passwords, and each signed-in student's tasks, exams, expenses, attendance, CGPA, Pomodoro count, and settings. PDFs used for MCQ generation stay in the browser and are not uploaded.
 