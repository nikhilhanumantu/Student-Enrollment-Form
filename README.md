# Student Enrollment Web Form

A state-of-the-art Student Enrollment Web Form featuring a premium glassmorphic dark interface built using **HTML5, Bootstrap 5, jQuery**, and integrated with **JsonPowerDB (JPDB)**.

This project implements a strict state-control form workflow and features database integration for real-time primary key validation.

---

## ✨ Features

- **Premium Dark Glassmorphic Theme**: Designed with custom CSS, deep-space slate backgrounds, Google Font **Outfit**, input focus glowing indicators, and smooth micro-animations.
- **Sleek Settings Panel**: A collapsable DB Settings configuration panel at the top lets users enter and save their connection token directly in the browser (persisted securely in `LocalStorage`).
- **Interactive State-Control Workflow**:
  - **Initial State**: All input fields except the primary key (`rollNo`) are disabled. The `Save` and `Update` buttons are disabled. The cursor is automatically focused on the `rollNo` field.
  - **Record Found**: If the Roll Number exists in JPDB, the record is retrieved, fields are populated, the `rollNo` input is locked to prevent edits, the `Update` button is enabled, and the cursor focuses on `fullName`.
  - **Record Not Found**: If the Roll Number is new, all fields unlock for data entry, the `Save` button is enabled, and the cursor focuses on `fullName`.
- **Validation**: Strict client-side validation ensuring no fields are submitted blank.
- **Custom JPDB Wrapper Functions**: Incorporates custom wrappers for `PUT`, `GET_BY_KEY`, `UPDATE`, and `executeCommand` to eliminate external library network blockages or file truncation issues.

---

## 📅 Database Schema

- **Database Name**: `"SCHOOL-DB"`
- **Relation Name**: `"STUDENT-TABLE"`
- **Base URL**: `http://api.login2explore.com:5577`
- **Primary Key**: `rollNo` (Roll No)
- **Document Fields**:
  1. `rollNo` (Roll Number)
  2. `fullName` (Full Name)
  3. `studentClass` (Class)
  4. `birthDate` (Birth Date)
  5. `address` (Address)
  6. `enrollmentDate` (Enrollment Date)

---

## 📂 Project Structure

```text
├── css/
│   └── style.css      # Glassmorphic and responsive styling, custom animations
├── js/
│   └── app.js         # State machine logic, validation, JPDB helper wrappers
├── index.html         # Main user interface structured with Bootstrap 5
├── package.json       # Project configurations and dev dependencies (Vite)
└── README.md          # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v14 or higher) installed on your system.

### Installation

1. Clone or copy this project folder to your local machine.
2. Open your terminal in the project directory and run:
   ```bash
   npm install
   ```

### Running Locally

To launch the local development server:

1. Run the start script:
   ```bash
   npm run dev
   ```
2. Open the URL provided in your console (usually **`http://localhost:5173/`**) in your web browser.

### Configuring Database Connection

1. Click on the **Database Configuration Settings** card at the top of the form.
2. Paste your **JsonPowerDB Connection Token** into the field.
3. Click **Save Configuration** (the token is saved locally to your browser and will persist on reload).
4. Collapse the card and enter a roll number to test the enrollment form!
