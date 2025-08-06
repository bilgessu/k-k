#!/bin/bash

# Kill any existing streamlit processes
pkill -f streamlit

# Wait a moment for cleanup
sleep 2

# Start Streamlit application
echo "🌱 KökÖğreti Streamlit uygulaması başlatılıyor..."
cd "$(dirname "$0")"
python -m streamlit run streamlit_app.py \
    --server.port=8501 \
    --server.address=0.0.0.0 \
    --server.headless=true \
    --server.runOnSave=true \
    --logger.level=error \
    --theme.base=light \
    --theme.primaryColor="#98FB98" \
    --theme.backgroundColor="#F0FFF0" \
    --theme.secondaryBackgroundColor="#E8F5E8" \
    --theme.textColor="#2F4F2F"

echo "✅ Streamlit başarıyla başlatıldı: http://localhost:8501"