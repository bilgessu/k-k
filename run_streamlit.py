#!/usr/bin/env python3
"""
KökÖğreti Streamlit Application Runner
"""
import os
import sys
import subprocess
import time

def main():
    """Run the KökÖğreti Streamlit application"""
    
    print("🌱 KökÖğreti Streamlit Uygulaması Başlatılıyor...")
    
    # Kill existing streamlit processes
    try:
        subprocess.run(['pkill', '-f', 'streamlit'], check=False, capture_output=True)
        time.sleep(2)
        print("✅ Mevcut Streamlit süreçleri temizlendi")
    except Exception:
        pass
    
    # Check dependencies
    try:
        import streamlit
        print(f"✅ Streamlit {streamlit.__version__} yüklü")
    except ImportError:
        print("❌ Streamlit yüklü değil!")
        sys.exit(1)
    
    try:
        import google.generativeai
        print("✅ Google Generative AI yüklü")
    except ImportError:
        print("⚠️ Google Generative AI yüklü değil (isteğe bağlı)")
    
    # Start Streamlit
    cmd = [
        sys.executable, '-m', 'streamlit', 'run', 'streamlit_app.py',
        '--server.port=8501',
        '--server.address=0.0.0.0', 
        '--server.headless=true',
        '--server.runOnSave=true',
        '--logger.level=error',
        '--theme.base=light',
        '--theme.primaryColor=#98FB98',
        '--theme.backgroundColor=#F0FFF0',
        '--theme.secondaryBackgroundColor=#E8F5E8',
        '--theme.textColor=#2F4F2F'
    ]
    
    print("🚀 Streamlit başlatılıyor...")
    print(f"📋 Komut: {' '.join(cmd)}")
    
    try:
        # Run streamlit and capture output
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait a bit to see if it starts successfully
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Streamlit başarıyla başlatıldı!")
            print("🌐 Uygulama adresi: http://localhost:8501")
            print("🔄 Sürekli çalışıyor... Ctrl+C ile durdurun")
            
            # Keep running and show output
            try:
                stdout, stderr = process.communicate()
                if stdout:
                    print("Output:", stdout)
                if stderr:
                    print("Errors:", stderr)
            except KeyboardInterrupt:
                print("\n🛑 Streamlit durduruldu")
                process.terminate()
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Streamlit başlatılamadı (exit code: {process.returncode})")
            if stdout:
                print("Output:", stdout)
            if stderr:
                print("Error:", stderr)
            
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()