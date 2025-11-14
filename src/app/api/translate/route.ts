import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang = 'auto', targetLang = 'EN' } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPL_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepL API key not configured' },
        { status: 500 }
      )
    }

    // DeepL API endpoint - use api-free.deepl.com for free API keys
    // Free API keys end with :fx, paid keys use api.deepl.com
    const isFreeKey = apiKey.endsWith(':fx')
    const deeplUrl = isFreeKey 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate'
    
    // DeepL API expects JSON body with Authorization header
    const requestBody: {
      text: string[]
      target_lang: string
      source_lang?: string
    } = {
      text: [text], // DeepL expects an array of texts
      target_lang: targetLang.toUpperCase(),
    }
    
    // Add source_lang only if not 'auto'
    if (sourceLang && sourceLang.toUpperCase() !== 'AUTO') {
      requestBody.source_lang = sourceLang.toUpperCase()
    }
    
    console.log('DeepL API request:', {
      url: deeplUrl,
      sourceLang: sourceLang.toUpperCase(),
      targetLang: targetLang.toUpperCase(),
      textLength: text.length
    })

    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error('DeepL API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`
      }
      return NextResponse.json(
        { error: 'Translation failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.translations && data.translations.length > 0) {
      return NextResponse.json({
        translatedText: data.translations[0].text,
        detectedSourceLanguage: data.translations[0].detected_source_language,
      })
    }

    return NextResponse.json(
      { error: 'No translation returned' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

