import { Suspense } from 'react'
import { SignupPremiumForm } from './signup-premium-form'

export default function SignupPremiumPage() {
  return (
    <Suspense>
      <SignupPremiumForm />
    </Suspense>
  )
}
