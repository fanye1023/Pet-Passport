import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Supabase admin client lazily to avoid build-time errors
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set')
    }
    supabaseAdminInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return supabaseAdminInstance
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Get user_id from metadata
    const userId = session.metadata?.user_id

    if (!userId) {
      console.error('No user_id in session metadata')
      return NextResponse.json(
        { error: 'Missing user_id in metadata' },
        { status: 400 }
      )
    }

    // Update user subscription to premium with no expiration (lifetime access)
    // First try to update existing record
    const { data: existingRecord } = await getSupabaseAdmin()
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    let error
    if (existingRecord) {
      // Update existing record
      const result = await getSupabaseAdmin()
        .from('user_subscriptions')
        .update({
          tier: 'premium',
          expires_at: null, // Lifetime access - never expires
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      error = result.error
    } else {
      // Insert new record
      const result = await getSupabaseAdmin()
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier: 'premium',
          expires_at: null,
          stripe_customer_id: session.customer as string,
        })
      error = result.error
    }

    if (error) {
      console.error('Failed to update subscription:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    console.log(`Successfully upgraded user ${userId} to premium`)
  }

  return NextResponse.json({ received: true })
}
