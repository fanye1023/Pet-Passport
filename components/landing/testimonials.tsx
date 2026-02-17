'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Dog Mom to Max',
    avatar: null,
    rating: 5,
    text: 'Finally, all of Max\'s vet records in one place! The shared link feature saved us when we had to rush to an emergency vet. They had all his info instantly.',
  },
  {
    name: 'James K.',
    role: 'Cat Dad',
    avatar: null,
    rating: 5,
    text: 'I travel frequently and leave my cats with a sitter. Pet Passport makes it so easy to share feeding schedules, vet contacts, and medical history. Peace of mind!',
  },
  {
    name: 'Emily R.',
    role: 'Multi-pet Household',
    avatar: null,
    rating: 5,
    text: 'With 3 dogs and 2 cats, keeping track of vaccinations was a nightmare. Now I get reminders before anything expires. This app is a game changer.',
  },
  {
    name: 'Michael T.',
    role: 'Golden Retriever Owner',
    avatar: null,
    rating: 5,
    text: 'The calendar sync feature is brilliant. All my pet\'s appointments show up right in my Google Calendar. No more missed vet visits!',
  },
  {
    name: 'Lisa P.',
    role: 'Professional Dog Walker',
    avatar: null,
    rating: 5,
    text: 'My clients share their pet profiles with me. I have instant access to emergency contacts, dietary restrictions, and behavioral notes. So professional!',
  },
  {
    name: 'David & Anna',
    role: 'New Puppy Parents',
    avatar: null,
    rating: 5,
    text: 'As first-time pet owners, this app helped us stay organized with all the puppy vaccinations and checkups. The AI document scanning is incredibly accurate.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by Pet Parents Everywhere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of pet owners who trust Pet Passport to keep their furry friends&apos; information safe and organized.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <StarRating rating={testimonial.rating} />
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.9 average rating from 500+ pet parents</span>
          </div>
        </div>
      </div>
    </section>
  )
}
