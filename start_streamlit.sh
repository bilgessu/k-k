#!/bin/bash
echo "🌱 KökÖğreti Streamlit başlatılıyor..."
export PORT=8501
cd /home/runner/workspace
python -m streamlit run streamlit_app.py --server.port 8501 --server.address 0.0.0.0 --server.headless true