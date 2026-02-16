# How to run the Music App

You need **two terminals**: one for the backend (FastAPI), one for the frontend (Vite).

## Terminal 1 – Backend (FastAPI)

From the **project root** (folder that contains `main.py` and `scripts/`):

```bash
# Windows (PowerShell or CMD)
cd "C:\Users\User-pc\Desktop\kendi projelerim\reactspotifysimilarmusictemplate-main\reactspotifysimilarmusictemplate-main"

# Activate virtualenv if you use one
venv\Scripts\activate

# Start the API (must stay running)
uvicorn main:app --reload --host 0.0.0.0
```

Wait until you see: **Application startup complete** (and optionally **Startup complete. Chroma count: X**).

## Terminal 2 – Frontend (Vite)

```bash
cd frontend\frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

**If you see "Backend unreachable" or ECONNREFUSED in the Vite terminal:**  
The backend is not running. Start it in **Terminal 1** as above, then refresh the app.
