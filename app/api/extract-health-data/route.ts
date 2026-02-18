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

interface ExtractedHealthRecord {
  record_type: 'checkup' | 'surgery' | 'treatment' | 'allergy' | 'condition'
  title: string
  description: string | null
  record_date: string | null
  veterinarian: string | null
}

interface ExtractedMedication {
  name: string
  dosage: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
  prescribing_vet: string | null
  notes: string | null
}

interface ExtractionResult {
  records: ExtractedHealthRecord[]
  medications: ExtractedMedication[]
  allergies: string[]
  chronic_conditions: string[]
  surgeries: Array<{
    name: string
    date: string | null
    notes: string | null
  }>
  clinic_name: string | null
  clinic_address: string | null
  pet_name: string | null
  pet_weight: string | null
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

    const prompt = `You are a veterinary health document analyzer. Extract health information from this pet medical document.

Return a JSON object with this exact structure:
{
  "records": [
    {
      "record_type": "checkup|surgery|treatment|allergy|condition",
      "title": "Short descriptive title",
      "description": "Detailed description of the record",
      "record_date": "YYYY-MM-DD format or null",
      "veterinarian": "Name of vet or null"
    }
  ],
  "medications": [
    {
      "name": "Medication name",
      "dosage": "e.g., 10mg, 1 tablet",
      "frequency": "e.g., twice daily, every 8 hours",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null",
      "prescribing_vet": "Vet name or null",
      "notes": "Special instructions or null"
    }
  ],
  "allergies": ["List of known allergies"],
  "chronic_conditions": ["List of ongoing conditions like diabetes, heart disease, arthritis"],
  "surgeries": [
    {
      "name": "Surgery name/type",
      "date": "YYYY-MM-DD or null",
      "notes": "Any relevant notes"
    }
  ],
  "clinic_name": "Name of the veterinary clinic or null",
  "clinic_address": "Address of the clinic or null",
  "pet_name": "Name of the pet if found or null",
  "pet_weight": "Most recent weight if found or null"
}

INSTRUCTIONS:
1. Extract ALL health information from the document
2. For record_type, classify as:
   - "checkup" for routine exams, wellness visits, annual checkups
   - "surgery" for any surgical procedures (spay/neuter, dental extractions, tumor removal, etc.)
   - "treatment" for specific treatments, therapies, procedures that aren't surgery
   - "allergy" for allergy diagnoses or reactions
   - "condition" for diagnosed conditions, illnesses, chronic issues
3. Create separate records for each distinct health event
4. Extract ALL medications mentioned, including:
   - Current medications
   - Past medications
   - Prescribed medications
   - Flea/tick/heartworm preventatives
5. List ALL allergies found (food allergies, drug allergies, environmental)
6. List chronic/ongoing conditions separately
7. List all surgeries with dates if available
8. Dates should be in YYYY-MM-DD format
9. If year is not specified, assume current year (2025) or most recent past year

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
        records: [],
        medications: [],
        allergies: [],
        chronic_conditions: [],
        surgeries: []
      }, { status: 200 })
    }

    // Validate and clean the data
    const validRecordTypes = ['checkup', 'surgery', 'treatment', 'allergy', 'condition']
    const records = (extractedData.records || [])
      .filter(r => r.title && validRecordTypes.includes(r.record_type))
      .map(r => ({
        record_type: r.record_type,
        title: r.title,
        description: r.description || null,
        record_date: isValidDate(r.record_date) ? r.record_date : null,
        veterinarian: r.veterinarian || null
      }))

    const medications = (extractedData.medications || [])
      .filter(m => m.name)
      .map(m => ({
        name: m.name,
        dosage: m.dosage || null,
        frequency: m.frequency || null,
        start_date: isValidDate(m.start_date) ? m.start_date : null,
        end_date: isValidDate(m.end_date) ? m.end_date : null,
        prescribing_vet: m.prescribing_vet || null,
        notes: m.notes || null
      }))

    const allergies = Array.isArray(extractedData.allergies)
      ? extractedData.allergies.filter(a => typeof a === 'string' && a.trim())
      : []

    const chronicConditions = Array.isArray(extractedData.chronic_conditions)
      ? extractedData.chronic_conditions.filter(c => typeof c === 'string' && c.trim())
      : []

    const surgeries = (extractedData.surgeries || [])
      .filter(s => s.name)
      .map(s => ({
        name: s.name,
        date: isValidDate(s.date) ? s.date : null,
        notes: s.notes || null
      }))

    return NextResponse.json({
      records,
      medications,
      allergies,
      chronic_conditions: chronicConditions,
      surgeries,
      clinic_name: extractedData.clinic_name || null,
      clinic_address: extractedData.clinic_address || null,
      pet_name: extractedData.pet_name || null,
      pet_weight: extractedData.pet_weight || null
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
      records: [],
      medications: [],
      allergies: [],
      chronic_conditions: [],
      surgeries: []
    }, { status: 200 }) // Return 200 so frontend can show the error message
  }
}

function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
