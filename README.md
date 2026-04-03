
#  Kanban Project
[ER diagram](https://drive.google.com/file/d/1SgB2hvKsV0qvYBblpGrCRSZd22nhWxLL/view?usp=sharing)

A Kanban board application featuring a **React** frontend and a **Flask (Python)** backend with **MongoDB**.

## 🚀 Getting Started

First, clone the repository to your local machine:

```bash
git clone git@github.com:future-html/kanban.git
cd kanban
```

---

## 💻 Development Setup

To run this project, you will need to open **two separate terminal windows**.

### 1. Frontend (React)
The frontend provides the user interface for managing tasks.

```bash
# Navigate to the frontend directory
cd frontend/kanban

# Install dependencies
npm install

# Start the development server
npm run dev
```
> The frontend runs on `http://localhost:5173` (Vite default).

---

### 2. Backend (Python/Flask)
The backend handles the API logic and connects to the database.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install required packages
pip install flask flask-cors pymongo python-dotenv certifi

# Run the server
python3 app.py
```
> The backend runs on `http://localhost:3000`.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite |
| **Backend** | Python, Flask |
| **Database** | MongoDB |
| **Environment** | Python venv, Dotenv |

## 📝 Note on Environment Variables
Ensure you create a `.env` file in the `backend/` directory to store your MongoDB connection strings and other sensitive data before running the app.

# .env (mongodb database for development only)
MONGO_URI="mongodb+srv://futurewp286_db_user:2SEUMBioRF4RhEVX@cluster0.jeftwxk.mongodb.net/?appName=Cluster0"