import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const maxDuration = 120 // Allow up to 120 seconds for processing (with retries)

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if it's a rate limit or temporary error
      const isRetryable = lastError.message.includes('429') ||
                          lastError.message.includes('500') ||
                          lastError.message.includes('503') ||
                          lastError.message.includes('Too Many Requests') ||
                          lastError.message.includes('Internal Server Error')

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = initialDelayMs * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

interface ExtractedVaccine {
  vaccine_name: string
  administered_date: string | null
  expiration_date: string | null
  veterinarian: string | null
  notes: string | null
}

interface ExtractedReminder {
  title: string
  due_date: string
  event_type: 'vet_appointment' | 'medication'
  notes: string | null
}

interface ExtractionResult {
  vaccines: ExtractedVaccine[]
  reminders: ExtractedReminder[]
  clinic_name: string | null
  clinic_address: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { pdfUrl } = await request.json()

    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Gemini API key not configured' }, { status: 500 })
    }

    // Download the PDF
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: 'Failed to download PDF' }, { status: 400 })
    }

    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfArrayBuffer).toString('base64')

    // Use Gemini Flash to read the PDF
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a veterinary document analyzer. Extract vaccination information from this pet vaccination record document.

Return a JSON object with this exact structure:
{
  "vaccines": [
    {
      "vaccine_name": "Name of vaccine (e.g., Rabies, DHPP, Bordetella)",
      "administered_date": "YYYY-MM-DD format or null if not found",
      "expiration_date": "YYYY-MM-DD format - IMPORTANT: look for 'expires', 'valid until', 'next due', 'due date', 'revaccinate by', or calculate based on vaccine duration",
      "veterinarian": "Name of vet who administered or null",
      "notes": "Any relevant notes or null"
    }
  ],
  "reminders": [
    {
      "title": "Description of upcoming vaccine or appointment",
      "due_date": "YYYY-MM-DD format",
      "event_type": "vet_appointment or medication",
      "notes": "Any relevant notes or null"
    }
  ],
  "clinic_name": "Name of the veterinary clinic or null",
  "clinic_address": "Address of the clinic or null"
}

CRITICAL INSTRUCTIONS FOR EXPIRATION DATES:
1. Look carefully for expiration/due dates - they may be labeled as: "expires", "exp", "valid until", "next due", "due date", "revaccinate by", "booster due"
2. If no explicit expiration date is found, ESTIMATE based on standard vaccine durations:
   - Rabies: 1 year (first dose) or 3 years (subsequent) from administered date
   - DHPP/DAPP/DA2PP: 1 year from administered date
   - Bordetella: 6 months to 1 year from administered date
   - Leptospirosis: 1 year from administered date
   - Lyme: 1 year from administered date
   - Canine Influenza: 1 year from administered date
   - FVRCP (cats): 1-3 years from administered date
3. Create a reminder in the "reminders" array for EACH vaccine that has an expiration date

CRITICAL INSTRUCTIONS FOR REMINDERS:
- For EVERY vaccine with an expiration date, create a corresponding reminder
- The reminder title should be "[Vaccine Name] booster due"
- The due_date should match the vaccine's expiration_date
- Set event_type to "vet_appointment"

Dates should be in YYYY-MM-DD format.
If a year is not specified, assume the current year (2025) or next year for future dates.
Return ONLY the JSON object, no other text.`

    // Use retry logic for rate limits
    const result = await withRetry(async () => {
      return await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        },
        { text: prompt }
      ])
    })

    const response = result.response
    const responseText = response.text()

    let extractedData: ExtractionResult
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText)
      return NextResponse.json({
        error: 'Failed to parse extracted data',
        vaccines: [],
        reminders: []
      }, { status: 200 })
    }

    // Validate and clean the data
    const vaccines = (extractedData.vaccines || []).map(v => ({
      vaccine_name: v.vaccine_name || 'Unknown Vaccine',
      administered_date: isValidDate(v.administered_date) ? v.administered_date : null,
      expiration_date: isValidDate(v.expiration_date) ? v.expiration_date : null,
      veterinarian: v.veterinarian || null,
      notes: v.notes || null
    }))

    const reminders = (extractedData.reminders || []).filter(r =>
      r.title && isValidDate(r.due_date)
    ).map(r => ({
      title: r.title,
      due_date: r.due_date,
      event_type: r.event_type === 'medication' ? 'medication' : 'vet_appointment' as const,
      notes: r.notes || null
    }))

    return NextResponse.json({
      vaccines,
      reminders,
      clinic_name: extractedData.clinic_name || null,
      clinic_address: extractedData.clinic_address || null
    })

  } catch (error: unknown) {
    console.error('Extraction error:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to extract data from PDF'

    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        errorMessage = 'Rate limit reached. Please wait a moment and try again.'
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        errorMessage = 'AI service temporarily unavailable. Please try again.'
      } else if (error.message.includes('404')) {
        errorMessage = 'AI model not available. Please try again later.'
      }
    }

    return NextResponse.json({
      error: errorMessage,
      vaccines: [],
      reminders: []
    }, { status: 200 }) // Return 200 so frontend can show the error message
  }
}

function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
