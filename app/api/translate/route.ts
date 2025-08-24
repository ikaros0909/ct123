import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import OpenAI from 'openai'

// OpenAI API 키가 있을 때만 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { text, targetLanguage = 'en' } = await req.json()
      
      if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 })
      }

      let translatedText = text

      if (openai && targetLanguage === 'en') {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a professional translator specializing in business and financial terminology. 
                
Translate the given Korean text to natural, professional English while maintaining the original meaning and context. 
Keep technical terms accurate and use business-appropriate language.

Rules:
1. Provide only the translation, no explanations
2. Maintain professional tone
3. Keep financial and business terminology precise
4. If the text contains specific company names or proper nouns, keep them as-is`
              },
              {
                role: "user",
                content: text
              }
            ],
            temperature: 0.1,
            max_tokens: 500,
          })

          const response = completion.choices[0]?.message?.content?.trim()
          if (response) {
            translatedText = response
          }
        } catch (error) {
          console.error('OpenAI translation error:', error)
          // Fall back to original text if translation fails
        }
      } else if (!openai) {
        console.log('⚠️ OpenAI API key not available, returning original text')
      }

      return NextResponse.json({ 
        success: true,
        originalText: text,
        translatedText,
        targetLanguage
      })

    } catch (error) {
      console.error('Translation error:', error)
      return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }
  })
}