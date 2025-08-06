#!/usr/bin/env python3
"""
AtaMind Python Startup Script
Run this to start the Python FastAPI backend
"""

import uvicorn
import os
from pathlib import Path

def main():
    # Ensure directories exist
    Path("uploads").mkdir(exist_ok=True)
    Path("static").mkdir(exist_ok=True)
    
    print("🌈" * 50)
    print("🎨 Starting AtaMind Python Backend 🎨")
    print("🚀 AI-Powered Turkish Children Education 🚀")
    print("🌈" * 50)
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()