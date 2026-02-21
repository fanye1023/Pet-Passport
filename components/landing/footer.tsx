import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Twitter, Github, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '/share/demo-buddy-golden' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: 'mailto:support@petpassport.app' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socialLinks = [
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'GitHub', href: '#', icon: Github },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo href="/" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Share your pet's info safely with dog walkers, pet sitters, and anyone who cares for your pet.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h3 className="font-semibold mb-4 text-sm">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pet Passport. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for pet parents everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
