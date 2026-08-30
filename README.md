# ⌨️ Typing Class

An interactive, vibrant, and child-friendly full-stack web application designed to help children learn touch typing. This application guides kids from absolute beginner keyboard drills up to timed exam preparation, featuring cartoon toy companions (Teddy, Robot, Car) that react to keystrokes, pop balloons, sound synthesizers, and printable certificates of achievement.

---

## 🌟 Features

1. **🧸 Beginner Mode – Toy Jumper**: Learn single keyboard characters (Home Row, Top Row, Bottom Row). Typing correct keys triggers interactive cartoon SVGs (waving Teddy, jumping Robot, moving Car) and gives color-coded finger guidance. No stress, no timer!
2. **🎈 Intermediate Mode – Balloon Popper**: Type complete words printed on floating colorful balloons. Correct answers pop the balloons with satisfying sound effects before they drift off-screen. Uses a casual countdown timer.
3. **🏆 Exam Mode – Time Cadet**: A formal paragraph typing test measuring typing speed in **Words Per Minute (WPM)** and **Accuracy**. Records are validated on the backend to prevent cheating.
4. **📊 Leaderboard**: A global scoreboard showcasing top typists ranked by speed and accuracy.
5. **🖨️ Printable Certificates**: Earn a customizable gold-medal Certificate of Achievement upon completing an exam with passing stats, printable directly using the browser print system.
6. **🔊 Web Audio API Sound System**: Synthesizes mechanical keyboard key clicks, wrong beeps, chimes, pop sounds, and complete fanfare programmatically in the browser (no external files needed!).
7. **💾 Backend Database**: SQLite database tracking multiple user profiles, their lesson progress percentages, and exam history.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Web Audio API, SVG CSS Animations.
* **Backend**: Python 3, Flask.
* **Database**: SQLite, Flask-SQLAlchemy (ORM).
* **Testing**: Python `unittest` integration tests.

---

## 📁 Folder Structure

```text
typing-class/
│
├── app.py                  # Flask Application Factory & Server entrypoint
├── config.py               # SQLite Connection Configurations
├── requirements.txt        # Backend dependencies
├── README.md               # Setup and usage guide
├── typing_class.db         # Auto-generated SQLite Database file
│
├── models/                 # SQLAlchemy DB schemas
│   ├── __init__.py
│   ├── user.py             # User profile (name, age)
│   ├── progress.py         # Beginner & Intermediate lessons completion
│   └── exam_result.py      # Exam Cadet results
│
├── routes/                 # Flask REST Blueprints
│   ├── __init__.py
│   ├── user_routes.py      # /api/users endpoints
│   ├── progress_routes.py  # /api/progress endpoints
│   └── exam_routes.py      # /api/exam-results & /api/leaderboard endpoints
│
├── services/               # Business and calculation logic
│   ├── __init__.py
│   └── typing_service.py   # WPM, accuracy, score validation & leaderboard sorting
│
├── templates/
│   └── index.html          # Single Page Application layouts
│
├── static/
│   ├── css/
│   │   └── styles.css      # Pastel visual themes & key guides
│   └── js/
│       ├── app.js          # Main app logic, audio synth, and networking
│       ├── beginner.js     # Beginner toy animator
│       ├── intermediate.js # Intermediate balloon pop controller
│       └── exam.js         # Exam navigation & text cursor marker
│
└── tests/
    ├── __init__.py
    └── test_app.py         # Backend integration tests
```

---

## 💾 Database Schema

### 1. `users` Table
* `id` (INTEGER, Primary Key)
* `name` (VARCHAR, Nullable=False) - Minimum 2 characters.
* `age` (INTEGER, Nullable=False) - Must be between 3 and 100.
* `created_at` (DATETIME) - Automatically generated signup timestamp.

### 2. `progress` Table
* `id` (INTEGER, Primary Key)
* `user_id` (INTEGER, Foreign Key -> `users.id` cascade delete)
* `level` (VARCHAR) - `'beginner'` or `'intermediate'`.
* `lesson` (VARCHAR) - Active key-drill or word challenge name.
* `words_completed` (INTEGER) - Characters or word pops counts.
* `accuracy` (FLOAT) - Averaged accuracy percentage.
* `wpm` (FLOAT) - Typing speed in words per minute.
* `best_wpm` (FLOAT) - Historical highest speed in this level.
* `updated_at` (DATETIME) - Last practice timestamp.

### 3. `exam_results` Table
* `id` (INTEGER, Primary Key)
* `user_id` (INTEGER, Foreign Key -> `users.id` cascade delete)
* `exam_type` (VARCHAR) - Name of paragraph typed.
* `wpm` (FLOAT) - Back-end calculated speed.
* `accuracy` (FLOAT) - Back-end calculated accuracy.
* `score` (INTEGER) - Grade score out of 100.
* `errors` (INTEGER) - Number of typos submitted.
* `duration` (INTEGER) - Time elapsed in seconds.
* `completed_at` (DATETIME) - Submission timestamp.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | Register user or fetch matching profile | `{"name": "Aarav", "age": 7}` |
| **GET** | `/api/users/<user_id>` | Retrieve user details | *None* |
| **POST** | `/api/progress` | Save/update practice progress | `{"user_id": 1, "level": "beginner", "lesson": "Home Row (F J)", "words_completed": 10, "accuracy": 95, "wpm": 12}` |
| **GET** | `/api/progress/<user_id>` | Load all progress milestones | *None* |
| **POST** | `/api/exam-results` | Validate and save timed exam metrics | `{"user_id": 1, "exam_type": "Time Cadet", "typed_chars": 150, "errors": 3, "duration": 60}` |
| **GET** | `/api/exam-results/<user_id>` | Fetch user exam history | *None* |
| **GET** | `/api/leaderboard` | Get ranked top typists (sort: WPM desc, accuracy desc) | *None* |

---

## 🚀 Setup & Run Instructions (Windows)

Open your command prompt or PowerShell and navigate to the project directory:

```bash
cd C:\Users\karth\.gemini\antigravity-ide\scratch\typing-class
```

### 1. Create a Python Virtual Environment
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
* **Command Prompt**:
  ```cmd
  venv\Scripts\activate.bat
  ```
* **PowerShell**:
  ```powershell
  venv\Scripts\activate.ps1
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Integration Tests
Before launching the server, run the testing suite to verify backend setups:
```bash
python -m unittest tests/test_app.py
```

### 5. Start the Flask Server
```bash
python app.py
```

### 6. Play the Game
Open your web browser and navigate to:
```text
http://127.0.0.1:5000/
```
Select a profile, choose a level, and start typing! 🚀
