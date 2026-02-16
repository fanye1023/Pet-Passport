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

interface ExtractedInsurance {
  provider_name: string | null
  policy_number: string | null
  coverage_type: string | null
  start_date: string | null
  end_date: string | null
  contact_phone: string | null
  contact_email: string | null
  deductible: string | null
  annual_limit: string | null
  reimbursement_rate: string | null
  covered_services: string[] | null
  excluded_services: string[] | null
  preventative_care: string[] | null
  waiting_periods: string | null
  notes: string | null
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

    const prompt = `You are a pet insurance document analyzer. Extract insurance policy information from this pet insurance document.

Return a JSON object with this exact structure:
{
  "provider_name": "Name of the insurance company (e.g., Healthy Paws, Trupanion, Nationwide)",
  "policy_number": "Policy or member ID number",
  "coverage_type": "Type of coverage (e.g., Accident & Illness, Accident Only, Comprehensive, Wellness)",
  "start_date": "YYYY-MM-DD format - policy effective/start date",
  "end_date": "YYYY-MM-DD format - policy expiration/renewal date",
  "contact_phone": "Customer service or claims phone number",
  "contact_email": "Customer service or claims email address",
  "deductible": "Annual deductible amount (e.g., $250, $500)",
  "annual_limit": "Annual coverage limit (e.g., $10,000, Unlimited)",
  "reimbursement_rate": "Reimbursement percentage (e.g., 80%, 90%)",
  "covered_services": ["List of covered services/conditions"],
  "excluded_services": ["List of exclusions or not covered items"],
  "preventative_care": ["List of preventative/wellness care items with coverage amounts, e.g., 'Annual exam (up to $50)', 'Vaccinations ($25/vaccine)'"],
  "waiting_periods": "Information about waiting periods for coverage",
  "notes": "Any other important policy details"
}

INSTRUCTIONS:
1. Extract all available information from the document
2. Use null for any fields that are not found in the document
3. Dates should be in YYYY-MM-DD format
4. For coverage_type, summarize as: "Accident & Illness", "Accident Only", "Comprehensive", "Wellness", or similar
5. Look for policy numbers in various formats: "Policy #", "Member ID", "Certificate Number", etc.
6. Phone numbers should include area code
7. For covered_services and excluded_services, list the main items (up to 10 each)
8. For preventative_care, look for wellness benefits AND their coverage amounts. Include the dollar amount or limit for each item. Examples: "Annual wellness exam (up to $50)", "Vaccinations ($25 per vaccine)", "Flea/tick prevention ($100/year)", "Dental cleaning ($150 max)", "Spay/neuter ($200)". Common items: annual exams, vaccinations, flea/tick prevention, heartworm prevention/testing, dental cleanings, spay/neuter, microchipping, routine bloodwork
9. If a year is not specified for dates, assume the current year (2025) or next year for future dates

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

    let extractedData: ExtractedInsurance
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
        insurance: null
      }, { status: 200 })
    }

    // Validate and clean the data
    const insurance: ExtractedInsurance = {
      provider_name: extractedData.provider_name || null,
      policy_number: extractedData.policy_number || null,
      coverage_type: extractedData.coverage_type || null,
      start_date: isValidDate(extractedData.start_date) ? extractedData.start_date : null,
      end_date: isValidDate(extractedData.end_date) ? extractedData.end_date : null,
      contact_phone: extractedData.contact_phone || null,
      contact_email: extractedData.contact_email || null,
      deductible: extractedData.deductible || null,
      annual_limit: extractedData.annual_limit || null,
      reimbursement_rate: extractedData.reimbursement_rate || null,
      covered_services: Array.isArray(extractedData.covered_services) ? extractedData.covered_services : null,
      excluded_services: Array.isArray(extractedData.excluded_services) ? extractedData.excluded_services : null,
      preventative_care: Array.isArray(extractedData.preventative_care) ? extractedData.preventative_care : null,
      waiting_periods: extractedData.waiting_periods || null,
      notes: extractedData.notes || null,
    }

    // Check if we got any meaningful data
    const hasData = insurance.provider_name || insurance.policy_number || insurance.coverage_type

    return NextResponse.json({
      insurance: hasData ? insurance : null,
      message: hasData ? 'Insurance data extracted successfully' : 'No insurance data found in document'
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
      insurance: null
    }, { status: 200 }) // Return 200 so frontend can show the error message
  }
}

function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
