import streamlit as st
import os

# Configure page
st.set_page_config(
    page_title="KökÖğreti",
    page_icon="🌱",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main { background-color: #F0FFF0; }
    .stSidebar { background-color: #E8F5E8; }
    .stButton > button {
        background-color: #98FB98;
        color: #2F4F2F;
        border-radius: 20px;
        padding: 0.5rem 1rem;
    }
    .story-card {
        background-color: #FFFFFF;
        padding: 1.5rem;
        border-radius: 15px;
        border-left: 5px solid #98FB98;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

def main():
    # Header
    st.markdown('<h1 style="color: #2F4F2F;">🌱 KökÖğreti</h1>', unsafe_allow_html=True)
    st.markdown('<p style="color: #228B22;">AI Destekli Türk Kültürü ve Değerleri Eğitimi</p>', unsafe_allow_html=True)
    
    # Sidebar navigation
    with st.sidebar:
        st.markdown("### 📖 Navigasyon")
        page = st.selectbox(
            "Sayfa Seçin:",
            ["🏠 Ana Sayfa", "🎭 Hikaye Oluştur", "📚 Hikaye Dinle", "🎮 Oyunlar", "📊 İstatistikler"]
        )
    
    # Main content
    if page == "🏠 Ana Sayfa":
        show_home()
    elif page == "🎭 Hikaye Oluştur":
        show_story_creation()
    elif page == "📚 Hikaye Dinle":
        show_story_library()
    elif page == "🎮 Oyunlar":
        show_games()
    elif page == "📊 İstatistikler":
        show_statistics()

def show_home():
    st.markdown("""
    <div class="story-card">
        <h3>🎯 KökÖğreti Nedir?</h3>
        <p>KökÖğreti, Türk kültürü ve geleneksel değerlerini çocuklarınıza öğretmek için 
        geliştirilmiş yapay zeka destekli bir eğitim platformudur.</p>
        
        <h4>🚀 Özellikler:</h4>
        <ul>
            <li>🎭 AI ile kişiselleştirilmiş hikaye oluşturma</li>
            <li>📊 Çocuk gelişim takibi ve analizi</li>
            <li>🎤 Ses tabanlı değer aktarımı</li>
            <li>🔒 Güvenli ve kültürel olarak uygun içerik</li>
            <li>📈 Gerçek zamanlı öğrenme analitiği</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
    
    # Quick action buttons
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("🎭 Yeni Hikaye", use_container_width=True):
            st.success("Hikaye oluşturma sayfasına yönlendiriliyorsunuz...")
    
    with col2:
        if st.button("📚 Hikaye Dinle", use_container_width=True):
            st.success("Hikaye kütüphanesine yönlendiriliyorsunuz...")
    
    with col3:
        if st.button("🎮 Oyunlar", use_container_width=True):
            st.success("Oyunlar sayfasına yönlendiriliyorsunuz...")
    
    with col4:
        if st.button("📊 İstatistikler", use_container_width=True):
            st.success("İstatistikler sayfasına yönlendiriliyorsunuz...")

def show_story_creation():
    st.markdown("## 🎭 Hikaye Oluştur")
    
    with st.form("story_form"):
        st.markdown("### Çocuk Bilgileri")
        child_name = st.text_input("Çocuğun Adı", "Ahmet")
        child_age = st.selectbox("Yaş", [3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        
        st.markdown("### Değerler")
        values = st.multiselect(
            "Öğretmek istediğiniz değerler:",
            ["Saygı", "Dürüstlük", "Paylaşım", "Yardımlaşma", "Nezaket", "Sorumluluk"],
            default=["Saygı", "Dürüstlük"]
        )
        
        st.markdown("### Anne/Baba Mesajı")
        parent_message = st.text_area(
            "Çocuğunuza iletmek istediğiniz mesaj:",
            "Saygılı olmak çok önemlidir. Büyüklerimize ve arkadaşlarımıza karşı hep saygılı olmalıyız."
        )
        
        if st.form_submit_button("🎭 Hikaye Oluştur", use_container_width=True):
            with st.spinner("Hikaye oluşturuluyor..."):
                story = create_simple_story(child_name, child_age, values, parent_message)
                
                st.success("Hikaye başarıyla oluşturuldu!")
                st.markdown(f"""
                <div class="story-card">
                    <h3>📖 {child_name}'in Hikayesi</h3>
                    <p>{story}</p>
                </div>
                """, unsafe_allow_html=True)
                
                if st.button("🔊 Anne Sesi ile Dinle"):
                    st.info("🎵 Hikaye seslendirildi!")

def show_story_library():
    st.markdown("## 📚 Hikaye Kütüphanesi")
    
    stories = [
        {"title": "Selim ve Tatlı Sürpriz", "description": "Paylaşımın önemini öğreten hikaye", "values": ["Paylaşım", "Nezaket"]},
        {"title": "Ahmet ve Ballı Kurabiyek", "description": "Dürüstlüğün değerini anlatan hikaye", "values": ["Dürüstlük", "Sorumluluk"]},
        {"title": "Ayşe ve Kedisi", "description": "Hayvan sevgisi ve şefkat", "values": ["Şefkat", "Sorumluluk"]},
        {"title": "Ali'nin Okul Günü", "description": "Saygı ve arkadaşlık", "values": ["Saygı", "Arkadaşlık"]}
    ]
    
    for i, story in enumerate(stories):
        col1, col2, col3 = st.columns([3, 1, 1])
        
        with col1:
            st.markdown(f"""
            <div class="story-card">
                <h4>📖 {story['title']}</h4>
                <p>{story['description']}</p>
                <small>Değerler: {', '.join(story['values'])}</small>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            if st.button("🔊 Anne Sesi", key=f"voice_{i}"):
                st.success("🎵 Hikaye anne sesi ile çalıyor!")
        
        with col3:
            if st.button("🎮 Oyunlar", key=f"games_{i}"):
                st.info("🎯 Oyun başlıyor!")

def show_games():
    st.markdown("## 🎮 Eğitici Oyunlar")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="story-card">
            <h4>🧩 Değer Eşleştirme</h4>
            <p>Hikayedeki karakterleri ve değerleri doğru şekilde eşleştirin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🎯 Eşleştirme Oyunu", use_container_width=True):
            st.balloons()
            st.success("🎉 Tüm değerleri doğru eşleştirdin! +10 puan!")
    
    with col2:
        st.markdown("""
        <div class="story-card">
            <h4>🎭 Karakter Oyunu</h4>
            <p>Hikayedeki karakterlerin rollerini tahmin edin!</p>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🎪 Karakter Oyunu", use_container_width=True):
            st.success("✅ Harika! Doğru bir seçim!")

def show_statistics():
    st.markdown("## 📊 İstatistikler")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Toplam Hikaye", "156", "12")
    with col2:
        st.metric("Aktif Çocuk", "3", "1")
    with col3:
        st.metric("Bu Ay Dinlenen", "45", "8")
    
    st.markdown("""
    <div class="story-card">
        <h4>📈 Son Aktiviteler</h4>
        <ul>
            <li>✅ Ahmet - "Selim ve Tatlı Sürpriz" hikayesini dinledi</li>
            <li>✅ Ayşe - Değer eşleştirme oyununu tamamladı</li>
            <li>✅ Ali - Yeni hikaye oluşturdu</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

def create_simple_story(child_name, child_age, values, parent_message):
    """Create a simple story without AI"""
    return f"""
    Bir varmış bir yokmuş, {child_name} adında çok sevimli bir çocuk varmış. 
    {child_name} {child_age} yaşındaymış ve her gün yeni şeyler öğrenmeyi çok seviyormuş.
    
    Bir gün {child_name} ailesinin değerlerini öğrenmeye karar vermiş. 
    Anne ve babasından {', '.join(values)} gibi değerleri öğrenmiş.
    
    Anne ve babası ona şunu söylemiş: "{parent_message}"
    
    {child_name} bu değerleri öğrenince çok mutlu olmuş ve bunları hep hatırlamış.
    Ve böylece mutlu mesut yaşamışlar.
    """

if __name__ == "__main__":
    main()