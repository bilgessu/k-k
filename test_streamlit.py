#!/usr/bin/env python3
"""
Simple Streamlit test application
"""
import streamlit as st

st.title("KökÖğreti Test")
st.write("Bu bir test sayfasıdır.")

if st.button("Test Butonu"):
    st.success("Test başarılı!")

st.write("Eğer bu mesajı görüyorsanız, Streamlit çalışıyor!")