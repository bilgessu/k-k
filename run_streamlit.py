#!/usr/bin/env python3
"""
KökÖğreti Streamlit Application Runner
Starts the Streamlit app on the specified port
"""

import subprocess
import sys
import os

def main():
    """Run the Streamlit application"""
    port = os.getenv('PORT', '8501')
    
    # Run Streamlit with proper configuration
    cmd = [
        sys.executable, '-m', 'streamlit', 'run',
        'streamlit_app.py',
        '--server.port', port,
        '--server.address', '0.0.0.0',
        '--server.headless', 'true',
        '--server.enableCORS', 'false',
        '--server.enableXsrfProtection', 'false'
    ]
    
    print(f"🌱 KökÖğreti başlatılıyor - http://0.0.0.0:{port}")
    subprocess.run(cmd)

if __name__ == "__main__":
    main()