#!/bin/bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
# Compare this snippet from .gitignore:
# __pycache__/
# .DS_Store
# .env
# .vscode/              # Visual Studio Code settings                   