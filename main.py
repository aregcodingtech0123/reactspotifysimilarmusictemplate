"""
Thin launcher so `uvicorn main:app` works from the project root.
The FastAPI app is defined in scripts/main.py.
Load .env first, then load the app by file path so the uvicorn worker always finds it.
"""
import importlib.util
import os
import sys
from pathlib import Path

# Project root: directory containing this main.py
_project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(_project_root))

from dotenv import load_dotenv

load_dotenv()
load_dotenv(dotenv_path=_project_root / ".env")
load_dotenv(dotenv_path=_project_root / "scripts" / ".env")
load_dotenv(dotenv_path=_project_root / "backend-nest" / ".env")

if not os.getenv("GOOGLE_API_KEY"):
    print(
        "WARNING [root main.py]: GOOGLE_API_KEY not set. Tried .env in:",
        [str(_project_root / ".env"), str(_project_root / "scripts" / ".env"), str(_project_root / "backend-nest" / ".env")],
        file=sys.stderr,
    )
else:
    print("GOOGLE_API_KEY loaded from .env (root launcher).", file=sys.stderr)

# Load scripts/main.py by path so it works in uvicorn's spawned subprocess (no "scripts" package needed)
_scripts_dir = str(_project_root / "scripts")
if _scripts_dir not in sys.path:
    sys.path.insert(0, _scripts_dir)
_scripts_main = _project_root / "scripts" / "main.py"
_spec = importlib.util.spec_from_file_location("scripts_main", _scripts_main, submodule_search_locations=[_scripts_dir])
if _spec is None or _spec.loader is None:
    raise ImportError(f"Cannot load app from {_scripts_main}")
_module = importlib.util.module_from_spec(_spec)
sys.modules["scripts_main"] = _module
_spec.loader.exec_module(_module)
app = _module.app

__all__ = ["app"]
