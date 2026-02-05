// ترجمة تلقائية من العربية إلى لغات أخرى
const translateText = async (textAr) => {
  if (!textAr || textAr.trim() === '') {
    return {
      ar: textAr,
      en: '',
      fr: '',
      de: '',
      ru: '',
      ja: ''
    }
  }

  try {
    // استخدام Google Translate API عبر LibreTranslate (مجاني وبدون مفتاح API)
    const languages = {
      en: 'en',
      fr: 'fr',
      de: 'de',
      ru: 'ru',
      ja: 'ja',
      it: 'it'
    }

    const translations = {
      ar: textAr,
      en: '',
      fr: '',
      de: '',
      ru: '',
      ja: '',
      it: ''
    }

    // ترجمة مع MyMemory API (مجاني وبدون مفتاح)
    for (const [lang, code] of Object.entries(languages)) {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textAr)}&langpair=ar|${code}`
        )
        const data = await response.json()
        if (data.responseStatus === 200 && data.responseData.translatedText) {
          translations[lang] = data.responseData.translatedText
        }
      } catch (error) {
        console.error(`خطأ في ترجمة ${lang}:`, error)
      }
    }

    return translations
  } catch (error) {
    console.error('خطأ في الترجمة:', error)
    return {
      ar: textAr,
      en: textAr,
      fr: textAr,
      de: textAr,
      ru: textAr,
      ja: textAr,
      it: textAr
    }
  }
}

export { translateText }
