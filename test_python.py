#!/usr/bin/env python3
"""
Quick test script for AtaMind Python backend
"""

def test_imports():
    """Test all imports work correctly"""
    try:
        print("🐍 Testing Python imports...")
        
        import fastapi
        print("✅ FastAPI imported")
        
        import uvicorn
        print("✅ Uvicorn imported")
        
        import google.generativeai as genai
        print("✅ Google Generative AI imported")
        
        import openai
        print("✅ OpenAI imported")
        
        from app.models import User, Child, Story
        print("✅ Models imported")
        
        from app.database import get_db, create_tables
        print("✅ Database functions imported")
        
        from app.auth import mock_get_current_user
        print("✅ Auth functions imported")
        
        print("\n🌈 All Python components ready! 🌈")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_app_creation():
    """Test FastAPI app creation"""
    try:
        from main import app
        print("✅ FastAPI app created successfully")
        
        # Test basic route
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        print(f"✅ Health check: {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ App creation error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 AtaMind Python Backend Test 🚀")
    print("=" * 50)
    
    import_success = test_imports()
    app_success = test_app_creation() if import_success else False
    
    if import_success and app_success:
        print("\n🎉 Python backend is ready to run! 🎉")
        print("Run: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("\n❌ Some issues need to be resolved first.")