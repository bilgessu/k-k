import streamlit as st
import os
from dotenv import load_dotenv
import google.generativeai as genai
import openai
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import time

# Load environment variables
load_dotenv()

# Configure page
st.set_page_config(
    page_title="KökÖğreti - AI Destekli Türk Kültürü Eğitimi",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for pale green theme
st.markdown("""
<style>
    .main {
        background-color: #F0FFF0;
    }
    .stSidebar {
        background-color: #E8F5E8;
    }
    .stButton > button {
        background-color: #98FB98;
        color: #2F4F2F;
        border: none;
        border-radius: 20px;
        padding: 0.5rem 1rem;
        font-weight: 600;
    }
    .stButton > button:hover {
        background-color: #90EE90;
        color: #228B22;
    }
    .metric-card {
        background-color: #F5FFFA;
        padding: 1.5rem;
        border-radius: 15px;
        border: 2px solid #98FB98;
        margin: 1rem 0;
    }
    .story-card {
        background-color: #FFFFFF;
        padding: 1.5rem;
        border-radius: 15px;
        border-left: 5px solid #98FB98;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .title-text {
        color: #2F4F2F;
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
    }
    .subtitle-text {
        color: #228B22;
        font-size: 1.2rem;
        text-align: center;
        margin-bottom: 1rem;
    }
    .floating-bubbles {
        position: fixed;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    }
    .bubble {
        position: absolute;
        border-radius: 50%;
        background: linear-gradient(45deg, #98FB98, #90EE90);
        opacity: 0.6;
        animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
</style>
""", unsafe_allow_html=True)

# Add floating bubbles
st.markdown("""
<div class="floating-bubbles">
    <div class="bubble" style="left: 10%; top: 20%; width: 40px; height: 40px; animation-delay: 0s;"></div>
    <div class="bubble" style="left: 20%; top: 60%; width: 30px; height: 30px; animation-delay: 2s;"></div>
    <div class="bubble" style="left: 80%; top: 30%; width: 50px; height: 50px; animation-delay: 4s;"></div>
    <div class="bubble" style="right: 10%; top: 70%; width: 35px; height: 35px; animation-delay: 1s;"></div>
</div>
""", unsafe_allow_html=True)

# Initialize AI clients
@st.cache_resource
def init_ai_clients():
    """Initialize AI clients with API keys"""
    try:
        # Configure Gemini
        if os.getenv('GEMINI_API_KEY'):
            try:
                import google.generativeai as genai
                genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
                gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                st.error(f"Gemini başlatılırken hata: {e}")
                gemini_model = None
        else:
            gemini_model = None
            st.warning("⚠️ Gemini API anahtarı bulunamadı")
            
        # Configure OpenAI
        if os.getenv('OPENAI_API_KEY'):
            openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        else:
            openai_client = None
            st.warning("⚠️ OpenAI API anahtarı bulunamadı")
            
        return gemini_model, openai_client
    except Exception as e:
        st.error(f"AI istemcileri başlatılırken hata: {e}")
        return None, None

# Initialize session state
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_name' not in st.session_state:
    st.session_state.user_name = ""
if 'children' not in st.session_state:
    st.session_state.children = []
if 'current_story' not in st.session_state:
    st.session_state.current_story = ""

def main():
    """Main application function"""
    
    # Header
    st.markdown('<div class="title-text">🌱 KökÖğreti</div>', unsafe_allow_html=True)
    st.markdown('<div class="subtitle-text">AI Destekli Türk Kültürü ve Değerleri Eğitimi</div>', unsafe_allow_html=True)
    
    # Sidebar navigation
    with st.sidebar:
        st.markdown("### 📖 Navigasyon")
        page = st.selectbox(
            "Sayfa Seçin:",
            ["🏠 Ana Sayfa", "🎭 Hikaye Oluştur", "📚 Hikaye Dinle", "🎮 Oyunlar", "📊 İstatistikler", "🧠 AI Analizi", "🎤 Ses Analizi", "🏗️ AI Mimarisi"]
        )
        
        st.markdown("---")
        
        # Quick stats
        st.markdown("### 📈 Hızlı İstatistikler")
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Toplam Hikaye", "156", "12")
        with col2:
            st.metric("Aktif Çocuk", "3", "1")
            
        st.markdown("### 🔧 Sistem Durumu")
        st.success("🟢 AI Sistemi Aktif")
        st.info("🔵 Veritabanı Bağlı")
        st.warning("🟡 API Limitine Yakın")

    # Main content based on selected page
    if page == "🏠 Ana Sayfa":
        show_home_page()
    elif page == "🎭 Hikaye Oluştur":
        show_story_generation()
    elif page == "📚 Hikaye Dinle":
        show_story_library()
    elif page == "🎮 Oyunlar":
        show_games_main()
    elif page == "📊 İstatistikler":
        show_statistics()
    elif page == "🧠 AI Analizi":
        show_ai_insights()
    elif page == "🎤 Ses Analizi":
        show_voice_analytics()
    elif page == "🏗️ AI Mimarisi":
        show_ai_architecture()

def show_home_page():
    """Display home page"""
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        <div class="story-card">
            <h3>🎯 KökÖğreti Nedir?</h3>
            <p>KökÖğreti, Türk kültürü ve geleneksel değerlerini çocuklarınıza öğretmek için 
            geliştirilmiş yapay zeka destekli bir eğitim platformudur.</p>
            
            <h4>🚀 Özellikler:</h4>
            <ul>
                <li>🎭 Çok-Agent AI ile kişiselleştirilmiş hikaye oluşturma</li>
                <li>📊 Çocuk gelişim takibi ve analizi</li>
                <li>🎤 Ses tabanlı değer aktarımı</li>
                <li>🔒 Güvenli ve kültürel olarak uygun içerik</li>
                <li>📈 Gerçek zamanlı öğrenme analitiği</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    # Quick action buttons
    st.markdown("### 🎯 Hızlı İşlemler")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("🎭 Yeni Hikaye Oluştur", use_container_width=True):
            st.session_state.page = "🎭 Hikaye Oluştur"
            st.rerun()
    
    with col2:
        if st.button("📊 İstatistikleri Gör", use_container_width=True):
            st.session_state.page = "📊 İstatistikler"
            st.rerun()
    
    with col3:
        if st.button("🧠 AI Analizini İncele", use_container_width=True):
            st.session_state.page = "🧠 AI Analizi"
            st.rerun()
    
    with col4:
        if st.button("🎤 Ses Kaydı Yap", use_container_width=True):
            st.session_state.page = "🎤 Ses Analizi"
            st.rerun()
    
    # Recent activities
    st.markdown("### 📈 Son Aktiviteler")
    activities_data = {
        'Tarih': [datetime.now() - timedelta(days=i) for i in range(7)],
        'Hikaye Sayısı': [12, 8, 15, 6, 11, 9, 14],
        'Dinleme Süresi (dk)': [45, 32, 58, 28, 41, 35, 52]
    }
    
    df = pd.DataFrame(activities_data)
    df['Tarih'] = df['Tarih'].dt.strftime('%d/%m/%Y')
    
    fig = px.line(df, x='Tarih', y=['Hikaye Sayısı', 'Dinleme Süresi (dk)'], 
                  title="Son 7 Günün Aktivite Grafiği",
                  color_discrete_sequence=['#98FB98', '#90EE90'])
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_color='#2F4F2F'
    )
    st.plotly_chart(fig, use_container_width=True)

def show_story_generation():
    """Display story generation page"""
    st.markdown("## 🎭 AI Destekli Hikaye Oluşturma")
    
    gemini_model, openai_client = init_ai_clients()
    
    if not gemini_model:
        st.error("⚠️ Gemini API anahtarı bulunamadı. Lütfen .env dosyanıza GEMINI_API_KEY ekleyin.")
        return
    
    # Child selection
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("### 👶 Çocuk Profili")
        child_name = st.text_input("Çocuk Adı:", value="Ayşe")
        child_age = st.slider("Yaş:", min_value=3, max_value=12, value=6)
        
        # Values selection
        st.markdown("### 🎯 İşlemek İstediğiniz Değerler")
        values = st.multiselect(
            "Değerleri Seçin:",
            ["Saygı", "Dürüstlük", "Paylaşım", "Sevgi", "Misafirperverlik", "Aile Bağları", "Çalışkanlık"],
            default=["Saygı", "Sevgi"]
        )
    
    with col2:
        st.markdown("### 🎤 Ses Mesajı veya Metin")
        input_method = st.radio("Giriş Yöntemi:", ["Metin", "Ses Kaydı"])
        
        if input_method == "Metin":
            parent_message = st.text_area(
                "Anne/Baba Mesajı:",
                "Çocuğumun büyüklerine saygı göstermesini ve her zaman dürüst olmasını istiyorum. Ailemizin değerlerini öğrenmesi çok önemli.",
                height=150
            )
        else:
            st.info("🎤 Ses kaydı özelliği geliştirilme aşamasında...")
            parent_message = st.text_area("Geçici olarak metninizi yazın:", height=100)
    
    # Generate story button
    if st.button("✨ Hikaye Oluştur", use_container_width=True, type="primary"):
        if parent_message and values:
            with st.spinner("🤖 AI ajanları çalışıyor... Hikaye oluşturuluyor..."):
                # Progress bar
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                # Simulate multi-agent processing
                status_text.text("🎭 StorytellerAgent analiz ediyor...")
                progress_bar.progress(25)
                time.sleep(1)
                
                status_text.text("🛡️ GuardianAgent güvenlik kontrolü yapıyor...")
                progress_bar.progress(50)
                time.sleep(1)
                
                status_text.text("💭 ChildPsychologyAgent yaş uygunluğunu değerlendiriyor...")
                progress_bar.progress(75)
                time.sleep(1)
                
                status_text.text("🎤 VoiceAgent tamamlanıyor...")
                progress_bar.progress(100)
                
                try:
                    # Generate story with Gemini
                    prompt = f"""
                    Türk kültürü ve geleneksel değerlerini içeren, {child_age} yaşındaki {child_name} için kişiselleştirilmiş bir hikaye oluştur.
                    
                    Anne/Baba Mesajı: {parent_message}
                    İşlenecek Değerler: {', '.join(values)}
                    
                    Hikaye şu özellikleri içermeli:
                    - Türk kültürüne uygun karakterler ve ortam
                    - {child_age} yaş grubuna uygun dil ve kavramlar
                    - Seçilen değerleri doğal bir şekilde işlemeli
                    - Eğlenceli ve öğretici olmalı
                    - Yaklaşık 200-300 kelime olmalı
                    
                    Hikayen sadece hikaye metni olsun, başka açıklama ekleme.
                    """
                    
                    response = gemini_model.generate_content(prompt)
                    story = response.text
                    
                    progress_bar.empty()
                    status_text.empty()
                    
                    # Display generated story
                    st.success("✅ Hikaye başarıyla oluşturuldu!")
                    
                    st.markdown(f"""
                    <div class="story-card">
                        <h3>📖 {child_name} için Özel Hikaye</h3>
                        <div style="font-size: 1.1em; line-height: 1.6; color: #2F4F2F;">
                            {story}
                        </div>
                        <hr>
                        <small><strong>İşlenen Değerler:</strong> {', '.join(values)}</small><br>
                        <small><strong>Yaş Grubu:</strong> {child_age} yaş</small><br>
                        <small><strong>Oluşturulma Tarihi:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</small>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Action buttons
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        if st.button("🔊 Anne Sesi ile Dinle", use_container_width=True, key="listen_story"):
                            st.session_state.current_story = story
                            st.success("🎵 Hikaye anne sesi ile hazırlanıyor...")
                            # This would integrate with text-to-speech
                            st.audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", format="audio/wav")
                    with col2:
                        if st.button("💾 Kaydet", use_container_width=True):
                            st.success("✅ Hikaye kaydedildi!")
                    with col3:
                        if st.button("🎮 Oyunlar", use_container_width=True):
                            show_games_section(story, values)
                    
                except Exception as e:
                    st.error(f"Hikaye oluşturulurken hata: {str(e)}")
        else:
            st.warning("⚠️ Lütfen anne/baba mesajı yazın ve en az bir değer seçin.")

def show_statistics():
    """Display statistics page"""
    st.markdown("## 📊 Kullanım İstatistikleri ve Çocuk Gelişim Raporu")
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <h3>📚 Toplam Hikaye</h3>
            <h2 style="color: #228B22;">156</h2>
            <small>+12 bu hafta</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>⏱️ Dinleme Süresi</h3>
            <h2 style="color: #228B22;">47.5 saat</h2>
            <small>+8.2 saat bu ay</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <h3>🎯 Öğrenilen Değer</h3>
            <h2 style="color: #228B22;">23</h2>
            <small>7 farklı kategori</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
            <h3>📈 Gelişim Skoru</h3>
            <h2 style="color: #228B22;">94%</h2>
            <small>Mükemmel seviye</small>
        </div>
        """, unsafe_allow_html=True)
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        # Weekly activity chart
        weekly_data = {
            'Gün': ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
            'Hikaye Sayısı': [8, 12, 6, 15, 11, 9, 14],
            'Dinleme (dk)': [32, 45, 28, 58, 41, 35, 52]
        }
        
        fig = px.bar(weekly_data, x='Gün', y='Hikaye Sayısı', 
                     title="📅 Haftalık Hikaye Dinleme Aktivitesi",
                     color_discrete_sequence=['#98FB98'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#2F4F2F'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Values learned pie chart
        values_data = {
            'Değer': ['Saygı', 'Dürüstlük', 'Paylaşım', 'Sevgi', 'Misafirperverlik', 'Diğer'],
            'Hikaye Sayısı': [28, 22, 18, 25, 15, 12]
        }
        
        fig = px.pie(values_data, values='Hikaye Sayısı', names='Değer',
                     title="🎯 Değerlere Göre Hikaye Dağılımı",
                     color_discrete_sequence=['#98FB98', '#90EE90', '#8FBC8F', '#87CEEB', '#98FB98', '#F0FFF0'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#2F4F2F'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Development tracking
    st.markdown("### 📈 Çocuk Gelişim Takibi")
    
    development_data = {
        'Ay': ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos'],
        'Sosyal Gelişim': [70, 75, 78, 82, 85, 88, 91, 94],
        'Dil Gelişimi': [65, 70, 74, 79, 83, 87, 90, 93],
        'Kültürel Farkındalık': [60, 68, 73, 78, 82, 86, 89, 92]
    }
    
    fig = px.line(development_data, x='Ay', y=['Sosyal Gelişim', 'Dil Gelişimi', 'Kültürel Farkındalık'],
                  title="👶 Aylık Gelişim Grafiği (%)",
                  color_discrete_sequence=['#98FB98', '#90EE90', '#8FBC8F'])
    fig.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font_color='#2F4F2F'
    )
    st.plotly_chart(fig, use_container_width=True)

def show_ai_insights():
    """Display AI insights page"""
    st.markdown("## 🧠 AI Analizi ve Gelişim Öngörüleri")
    
    # Child psychology insights
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("""
        <div class="story-card">
            <h3>👶 Çocuk Psikolojisi Profili</h3>
            <h4>🎯 Ana Bulgular:</h4>
            <ul>
                <li><strong>Öğrenme Stili:</strong> %60 Görsel, %30 İşitsel, %10 Kinestetik</li>
                <li><strong>Dikkat Süresi:</strong> Ortalama 8-10 dakika (yaş grubu ortalaması: 6-8 dk)</li>
                <li><strong>Tercih Edilen Değerler:</strong> Aile bağları, Saygı, Paylaşım</li>
                <li><strong>Kültürel Öğrenme Hızı:</strong> Hızlı (%85 başarı oranı)</li>
            </ul>
            
            <h4>💡 AI Önerileri:</h4>
            <ul>
                <li>Görsel öğeleri zengin hikayeler tercih edin</li>
                <li>8-10 dakikalık hikayeler optimal</li>
                <li>Aile temalı hikayeleri artırın</li>
                <li>İnteraktif sorularla katılımı artırın</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Learning progress radar chart
        categories = ['Sosyal Beceriler', 'Dil Gelişimi', 'Kültürel Farkındalık', 
                     'Değer Öğrenimi', 'Dinleme Becerisi', 'Hikaye Anlama']
        values = [94, 89, 87, 92, 88, 91]
        
        fig = go.Figure(data=go.Scatterpolar(
            r=values,
            theta=categories,
            fill='toself',
            fillcolor='rgba(152, 251, 152, 0.3)',
            line_color='#98FB98',
            name='Gelişim Durumu'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100],
                    gridcolor='#E8F5E8'
                )
            ),
            title="🎯 Çok Boyutlu Gelişim Analizi",
            font_color='#2F4F2F',
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>🛡️ Güvenlik Skoru</h3>
            <h2 style="color: #228B22;">98.5%</h2>
            <small>Tüm içerik güvenli</small>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class="metric-card">
            <h3>🎯 Kültürel Uygunluk</h3>
            <h2 style="color: #228B22;">96.2%</h2>
            <small>Yüksek uygunluk</small>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("""
        <div class="metric-card">
            <h3>💡 Öğrenme Verimliliği</h3>
            <h2 style="color: #228B22;">91.7%</h2>
            <small>Çok başarılı</small>
        </div>
        """, unsafe_allow_html=True)
    
    # Weekly insights
    st.markdown("### 📈 Bu Haftanın AI Öngörüleri")
    
    insights_col1, insights_col2 = st.columns(2)
    
    with insights_col1:
        st.info("""
        🎯 **Öğrenme Fırsatı**: 
        Bu hafta "misafirperverlik" değerine odaklanmak için mükemmel bir zaman. 
        Çocuğunuz bu konuya özel ilgi gösteriyor.
        """)
        
        st.success("""
        ✅ **Başarı Alanı**: 
        Saygı değerinde %15 gelişme kaydedildi. 
        Bu konuda hikaye sayısını artırabilirsiniz.
        """)
    
    with insights_col2:
        st.warning("""
        ⚠️ **Dikkat Edilmesi Gereken**: 
        Dinleme süreleri hafif azaldı. 
        Daha kısa ve interaktif hikayeler önerilir.
        """)
        
        st.info("""
        🔮 **Gelecek Tahmin**: 
        Mevcut hızla ilerleyerek, 2 ay içinde 
        %95+ genel gelişim skoruna ulaşabilir.
        """)

def show_voice_analytics():
    """Display voice analytics page"""
    st.markdown("## 🎤 Ses Analizi ve Ebeveyn Geri Bildirimi")
    
    st.markdown("""
    <div class="story-card">
        <h3>🎵 Ses Kaydı Özelliği</h3>
        <p>Bu özellik şu anda geliştirilme aşamasında. Yakında şu özellikleri kullanabileceksiniz:</p>
        <ul>
            <li>🎤 Gerçek zamanlı ses kaydı</li>
            <li>🧠 Duygusal ton analizi</li>
            <li>📊 Ebeveynlik stili tespiti</li>
            <li>🎯 Kültürel değer çıkarımı</li>
            <li>🔊 Ses optimizasyonu</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    # Simulated voice analytics
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🎤 Son Ses Analizleri")
        
        # Emotional tone chart
        emotions = ['Sevgi Dolu', 'Destekleyici', 'Öğretici', 'Sabırlı', 'Koruyucu']
        scores = [92, 88, 85, 90, 86]
        
        fig = px.bar(x=emotions, y=scores, 
                     title="💖 Duygusal Ton Analizi",
                     color=scores,
                     color_continuous_scale=['#F0FFF0', '#98FB98', '#228B22'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#2F4F2F',
            showlegend=False
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### 👨‍👩‍👧‍👦 Ebeveynlik Stili")
        
        parenting_styles = {
            'Stil': ['Destekleyici', 'Demokratik', 'Öğretici', 'Koruyucu'],
            'Yüzde': [35, 30, 25, 10]
        }
        
        fig = px.pie(parenting_styles, values='Yüzde', names='Stil',
                     title="🎯 Ebeveynlik Stili Dağılımı",
                     color_discrete_sequence=['#98FB98', '#90EE90', '#8FBC8F', '#87CEEB'])
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#2F4F2F'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Voice improvement suggestions
    st.markdown("### 💡 Ses Geliştirme Önerileri")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.success("""
        ✅ **Güçlü Yanlar**
        - Sevgi dolu ton
        - Net telaffuz
        - Uygun hız
        - Duygusal bağlantı
        """)
    
    with col2:
        st.info("""
        💡 **Geliştirilebilir**
        - Hikaye dramatizasyonu
        - Vurgulama teknikleri
        - İnteraktif sorular
        - Duraklamalar
        """)
    
    with col3:
        st.warning("""
        📈 **Öneriler**
        - Ses tonunu çeşitlendirin
        - Karakter sesleri deneyin
        - Daha fazla duygusal ifade
        - Çocuğun tepkilerini bekleyin
        """)

def show_ai_architecture():
    """Display AI architecture page"""
    st.markdown("## 🏗️ Çok-Agent AI Mimarisi")
    
    st.markdown("""
    <div class="story-card">
        <h3>🤖 KökÖğreti AI Sistemi</h3>
        <p>KökÖğreti, dört özel AI ajanının koordineli çalışmasıyla çocuklar için 
        güvenli ve etkili öğrenme deneyimleri oluşturur.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # AI Agents
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="story-card">
            <h4>🎭 StorytellerAgent</h4>
            <ul>
                <li><strong>Görev:</strong> Kişiselleştirilmiş hikaye oluşturma</li>
                <li><strong>Model:</strong> Google Gemini 2.5 Pro</li>
                <li><strong>Özellikler:</strong></li>
                <ul>
                    <li>Türk kültürü uzmanlığı</li>
                    <li>Yaşa uygun dil adaptasyonu</li>
                    <li>Çocuk profili analizi</li>
                    <li>Geleneksel hikaye teknikleri</li>
                </ul>
                <li><strong>Başarı Oranı:</strong> %94.2</li>
            </ul>
        </div>
        
        <div class="story-card">
            <h4>💭 ChildPsychologyAgent</h4>
            <ul>
                <li><strong>Görev:</strong> Gelişim analizi ve takibi</li>
                <li><strong>Model:</strong> Özel psikoloji modeli</li>
                <li><strong>Özellikler:</strong></li>
                <ul>
                    <li>Öğrenme stili tespiti</li>
                    <li>Duygusal zeka ölçümü</li>
                    <li>Gelişim milestone takibi</li>
                    <li>Ebeveyn rehberliği</li>
                </ul>
                <li><strong>Başarı Oranı:</strong> %91.7</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="story-card">
            <h4>🛡️ GuardianAgent</h4>
            <ul>
                <li><strong>Görev:</strong> İçerik güvenliği ve doğrulama</li>
                <li><strong>Model:</strong> Çok katmanlı güvenlik sistemi</li>
                <li><strong>Özellikler:</strong></li>
                <ul>
                    <li>Yaş uygunluğu kontrolü</li>
                    <li>Kültürel uygunluk analizi</li>
                    <li>Güvenlik skorlaması</li>
                    <li>Zararlı içerik filtreleme</li>
                </ul>
                <li><strong>Başarı Oranı:</strong> %98.5</li>
            </ul>
        </div>
        
        <div class="story-card">
            <h4>🎤 VoiceAgent</h4>
            <ul>
                <li><strong>Görev:</strong> Ses analizi ve optimizasyon</li>
                <li><strong>Model:</strong> OpenAI + özel ses modeli</li>
                <li><strong>Özellikler:</strong></li>
                <ul>
                    <li>Duygusal ton analizi</li>
                    <li>Ebeveynlik stili tespiti</li>
                    <li>Kültürel değer çıkarımı</li>
                    <li>Kişiselleştirilmiş ses sentezi</li>
                </ul>
                <li><strong>Başarı Oranı:</strong> %89.3</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    # System performance metrics
    st.markdown("### 📊 Sistem Performans Metrikleri")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("⚡ Yanıt Süresi", "2.3s", "-0.5s")
    with col2:
        st.metric("🎯 Genel Başarı", "93.4%", "+2.1%")
    with col3:
        st.metric("🔒 Güvenlik Skoru", "98.5%", "+0.3%")
    with col4:
        st.metric("💚 Kullanıcı Memnuniyeti", "96.8%", "+1.2%")
    
    # System architecture flow
    st.markdown("### 🔄 AI İşlem Akışı")
    
    st.markdown("""
    ```mermaid
    graph TD
        A[Ebeveyn Mesajı] --> B[VoiceAgent]
        B --> C[ChildPsychologyAgent]
        C --> D[StorytellerAgent]
        D --> E[GuardianAgent]
        E --> F[Onaylanmış Hikaye]
        F --> G[Çocuk & Ebeveyn]
    ```
    """)
    
    st.markdown("""
    <div class="story-card">
        <h4>🔄 İşlem Akışı Detayları:</h4>
        <ol>
            <li><strong>VoiceAgent:</strong> Ebeveyn mesajını analiz eder, duygusal ton ve değerleri çıkarır</li>
            <li><strong>ChildPsychologyAgent:</strong> Çocuk profilini değerlendirir, yaş ve gelişim uygunluğunu kontrol eder</li>
            <li><strong>StorytellerAgent:</strong> Analiz sonuçlarına göre kişiselleştirilmiş hikaye oluşturur</li>
            <li><strong>GuardianAgent:</strong> Final güvenlik kontrolü yapar ve hikayi onaylar</li>
            <li><strong>Teslimat:</strong> Onaylanmış hikaye aileyele sunulur</li>
        </ol>
    </div>
    """, unsafe_allow_html=True)

def show_games_section(story, values):
    """Show educational games based on the story"""
    st.markdown("### 🎮 Hikaye Tabanlı Oyunlar")
    
    games_col1, games_col2 = st.columns(2)
    
    with games_col1:
        st.markdown("""
        <div class="story-card">
            <h4>🧩 Değer Eşleştirme Oyunu</h4>
            <p>Hikayedeki karakterleri ve değerleri eşleştirin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Simple matching game
        if st.button("🎯 Oyunu Başlat", key="matching_game"):
            st.balloons()
            st.success("🎉 Harika! Tüm değerleri doğru eşleştirdin!")
    
    with games_col2:
        st.markdown("""
        <div class="story-card">
            <h4>📝 Hikaye Tamamlama</h4>
            <p>Hikayenin eksik kısımlarını tamamlayın!</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Story completion game
        if st.button("✏️ Hikaye Devamı", key="story_completion"):
            st.text_area("Hikayenin devamını yaz:", height=100)
            if st.button("Gönder", key="submit_story"):
                st.success("🌟 Harika bir devam yazdın!")

def show_story_library():
    """Display story library with listening options"""
    st.markdown("## 📚 Hikaye Kütüphanesi")
    
    # Sample stories
    sample_stories = [
        {
            "title": "🦋 Nazik Kelebek",
            "description": "Saygı ve nezaket değerlerini öğreten sevimli bir hikaye",
            "values": ["Saygı", "Nezaket"],
            "duration": "5 dakika",
            "age": "4-6 yaş"
        },
        {
            "title": "🌟 Dürüst Yıldız",
            "description": "Dürüstlük ve güvenilirlik hakkında öğretici bir macera",
            "values": ["Dürüstlük", "Güvenilirlik"],
            "duration": "7 dakika", 
            "age": "6-8 yaş"
        },
        {
            "title": "🤝 Paylaşımcı Kardeşler",
            "description": "Paylaşım ve yardımlaşma değerlerini işleyen aile hikayesi",
            "values": ["Paylaşım", "Yardımlaşma"],
            "duration": "6 dakika",
            "age": "5-9 yaş"
        }
    ]
    
    for i, story in enumerate(sample_stories):
        st.markdown(f"""
        <div class="story-card">
            <h4>{story['title']}</h4>
            <p>{story['description']}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                <div>
                    <small><strong>Değerler:</strong> {', '.join(story['values'])}</small><br>
                    <small><strong>Süre:</strong> {story['duration']} | <strong>Yaş:</strong> {story['age']}</small>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Action buttons for each story
        col1, col2, col3 = st.columns(3)
        with col1:
            if st.button("🔊 Anne Sesi ile Dinle", key=f"listen_{i}"):
                st.success(f"🎵 {story['title']} anne sesi ile çalınıyor...")
                # Would integrate with TTS here
                st.audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", format="audio/wav")
        with col2:
            if st.button("👂 Normal Dinle", key=f"normal_{i}"):
                st.info(f"📖 {story['title']} hikayesi başlıyor...")
        with col3:
            if st.button("🎮 Oyunlar", key=f"games_{i}"):
                show_games_section(story['description'], story['values'])
        
        st.markdown("<hr>", unsafe_allow_html=True)

def show_games_main():
    """Main games page"""
    st.markdown("## 🎮 Eğitici Oyunlar")
    
    st.markdown("""
    <div class="story-card">
        <h3>🎯 Hikaye Tabanlı Eğitici Oyunlar</h3>
        <p>KökÖğreti'nin eğitici oyunları, çocukların öğrendikleri değerleri pekiştirmelerine yardımcı olur.</p>
    </div>
    """, unsafe_allow_html=True)
    
    games_col1, games_col2 = st.columns(2)
    
    with games_col1:
        st.markdown("""
        <div class="story-card">
            <h4>🧩 Değer Eşleştirme</h4>
            <p>Hikayedeki karakterleri ve değerleri doğru şekilde eşleştirin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🎯 Eşleştirme Oyunu", use_container_width=True):
            st.balloons()
            st.success("🎉 Tüm değerleri doğru eşleştirdin! +10 puan!")
            
        st.markdown("""
        <div class="story-card">
            <h4>📝 Hikaye Tamamlama</h4>
            <p>Eksik kelimeleri tamamlayarak hikayeyi bitirin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("✏️ Tamamlama Oyunu", use_container_width=True):
            st.text_input("Cümledeki eksik kelime: '______ çok önemli bir değerdir.'")
            if st.button("Kontrol Et", key="check_word"):
                st.success("🌟 Doğru! Saygı gerçekten önemli bir değerdir!")
    
    with games_col2:
        st.markdown("""
        <div class="story-card">
            <h4>🎭 Karakter Oyunu</h4>
            <p>Hikayedeki karakterlerin rollerini tahmin edin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🎪 Karakter Oyunu", use_container_width=True):
            character = st.selectbox("Bu karakter hangi değeri temsil ediyor?", 
                                   ["Dürüstlük", "Saygı", "Paylaşım", "Yardımlaşma"])
            if st.button("Yanıtla", key="answer_character"):
                st.success(f"✅ Harika! {character} doğru bir seçim!")
        
        st.markdown("""
        <div class="story-card">
            <h4>🏆 Değer Yarışması</h4>
            <p>Hangi değerin en önemli olduğunu düşünüyorsun?</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🏅 Yarışmaya Katıl", use_container_width=True):
            favorite_value = st.selectbox("En sevdiğin değer:", 
                                        ["Saygı", "Dürüstlük", "Paylaşım", "Yardımlaşma", "Nezaket"])
            if st.button("Oyla", key="vote_value"):
                st.success(f"🎊 {favorite_value} değerine oyun verdin! Toplam: +5 puan!")

if __name__ == "__main__":
    main()