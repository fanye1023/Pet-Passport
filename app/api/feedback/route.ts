import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { message, email, pageUrl } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Save to database
    const { error: dbError } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      email: email || user?.email || null,
      message: message.trim(),
      page_url: pageUrl || null,
    })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    // Send email notification
    const resendApiKey = process.env.RESEND_API_KEY
    const feedbackEmail = process.env.FEEDBACK_EMAIL

    if (resendApiKey && feedbackEmail) {
      try {
        const resend = new Resend(resendApiKey)

        await resend.emails.send({
          from: 'Pet ShareLink <feedback@petsharelink.com>',
          to: feedbackEmail,
          subject: 'New Feedback from Pet ShareLink',
          html: `
            <h2>New Feedback Received</h2>
            <p><strong>From:</strong> ${email || user?.email || 'Anonymous'}</p>
            <p><strong>Page:</strong> ${pageUrl || 'Unknown'}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="border-left: 3px solid #0d9488; padding-left: 12px; margin: 12px 0;">
              ${message.trim().replace(/\n/g, '<br>')}
            </blockquote>
            <p style="color: #666; font-size: 12px;">
              Sent at ${new Date().toISOString()}
            </p>
          `,
        })
      } catch (emailError) {
        // Log but don't fail - feedback is already saved
        console.error('Email error:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
