import subprocess
import sys
import os

def run():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("🚀 Starting Codex Restaurant Backend Server (FastAPI)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir,
        env=dict(os.environ, PYTHONPATH=backend_dir)
    )

    print("⚡ Starting Codex Restaurant Frontend Dev Server (Vite)...")
    frontend_proc = subprocess.Popen(
        ["cmd", "/c", "npm", "run", "dev"],
        cwd=frontend_dir
    )

    print("\n=======================================================")
    print("✨ Codex Restaurant system is up and running!")
    print("   Customer Menu URL: http://localhost:5173/table/1")
    print("   Staff Login URL:   http://localhost:5173/login")
    print("   Backend API Docs:  http://localhost:8000/docs")
    print("=======================================================\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping Codex Restaurant servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    run()
