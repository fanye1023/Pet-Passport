import { Header, Hero, UseCases, Features, Comparison, Pricing, Footer } from '@/components/landing'
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/json-ld'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <Header />
      <main className="flex-1">
        <Hero />
        <UseCases />
        <Features />
        <Comparison />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
