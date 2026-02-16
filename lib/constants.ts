// Time of day options used in routines and meal schedules
export const timeOfDayOptions = [
  { value: 'early_morning', label: 'Early Morning (5am - 7am)' },
  { value: 'morning', label: 'Morning (7am - 10am)' },
  { value: 'late_morning', label: 'Late Morning (10am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 3pm)' },
  { value: 'late_afternoon', label: 'Late Afternoon (3pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 8pm)' },
  { value: 'night', label: 'Night (8pm - 10pm)' },
  { value: 'late_night', label: 'Late Night (10pm+)' },
  { value: 'custom', label: 'Custom time...' },
]

export const timeOfDayLabels: Record<string, string> = {
  early_morning: 'Early Morning',
  morning: 'Morning',
  late_morning: 'Late Morning',
  afternoon: 'Afternoon',
  late_afternoon: 'Late Afternoon',
  evening: 'Evening',
  night: 'Night',
  late_night: 'Late Night',
}

export const timeOfDayOrder: Record<string, number> = {
  early_morning: 1,
  morning: 2,
  late_morning: 3,
  afternoon: 4,
  late_afternoon: 5,
  evening: 6,
  night: 7,
  late_night: 8,
}

export const timeOfDayRanges: Record<string, string> = {
  early_morning: '5am - 7am',
  morning: '7am - 10am',
  late_morning: '10am - 12pm',
  afternoon: '12pm - 3pm',
  late_afternoon: '3pm - 5pm',
  evening: '5pm - 8pm',
  night: '8pm - 10pm',
  late_night: '10pm+',
}

// Food constants
export const foodTypes = [
  { value: 'dry', label: 'Dry Food' },
  { value: 'wet', label: 'Wet Food' },
  { value: 'raw', label: 'Raw Diet' },
  { value: 'homemade', label: 'Homemade' },
  { value: 'treat', label: 'Treat' },
]

export const feedingFrequencyOptions = [
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Three times daily', label: 'Three times daily' },
  { value: 'Free feeding', label: 'Free feeding' },
]

export function getDefaultMealTimes(frequency: string): string[] {
  switch (frequency) {
    case 'Once daily': return ['morning']
    case 'Twice daily': return ['morning', 'evening']
    case 'Three times daily': return ['morning', 'afternoon', 'evening']
    default: return []
  }
}

// Routine constants
export const routineTypes = [
  { value: 'walk', label: 'Walk', icon: '🚶' },
  { value: 'medication', label: 'Medication', icon: '💊' },
  { value: 'play', label: 'Play Time', icon: '🎾' },
  { value: 'sleep', label: 'Sleep', icon: '😴' },
]

export const routineIcons: Record<string, string> = {
  walk: '🚶',
  feeding: '🍽️',
  medication: '💊',
  play: '🎾',
  sleep: '😴',
}

export const daysOfWeek = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

// Shopping link helpers with affiliate support
export function getAmazonSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant} pet food` : `${brand} pet food`
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG
  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  return tag ? `${baseUrl}&tag=${tag}` : baseUrl
}

export function getChewySearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  const affiliateId = process.env.NEXT_PUBLIC_CHEWY_AFFILIATE_ID
  const baseUrl = `https://www.chewy.com/s?query=${encodeURIComponent(query)}`
  // Chewy uses different affiliate link formats depending on network
  return affiliateId ? `${baseUrl}&ref=${affiliateId}` : baseUrl
}

export function getPetcoSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  return `https://www.petco.com/shop/en/petcostore/search?query=${encodeURIComponent(query)}`
}

export function getPetSmartSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  return `https://www.petsmart.com/search/?q=${encodeURIComponent(query)}`
}

// Pet pharmacy affiliate links
export function getChewyPharmacyUrl() {
  const affiliateId = process.env.NEXT_PUBLIC_CHEWY_AFFILIATE_ID
  const baseUrl = 'https://www.chewy.com/app/content/pharmacy'
  return affiliateId ? `${baseUrl}?ref=${affiliateId}` : baseUrl
}

export function getAmazonPharmacyUrl() {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG
  const baseUrl = 'https://www.amazon.com/s?k=pet+pharmacy'
  return tag ? `${baseUrl}&tag=${tag}` : baseUrl
}

// Pet insurance affiliate data
export const petInsuranceProviders = [
  {
    name: 'Lemonade Pet',
    description: 'AI-powered claims, customizable coverage, and instant payouts.',
    features: ['90% reimbursement option', 'No upper age limits', 'Covers hereditary conditions'],
    url: process.env.NEXT_PUBLIC_LEMONADE_AFFILIATE_URL || 'https://www.lemonade.com/pet',
    logo: '🍋',
    highlight: 'Best for Tech-Savvy Pet Parents',
  },
  {
    name: 'Healthy Paws',
    description: 'Unlimited lifetime benefits with no caps on claims.',
    features: ['No annual or lifetime limits', 'Fast claim processing', 'One simple plan'],
    url: process.env.NEXT_PUBLIC_HEALTHYPAWS_AFFILIATE_URL || 'https://www.healthypawspetinsurance.com',
    logo: '🐾',
    highlight: 'Best Unlimited Coverage',
  },
  {
    name: 'Embrace',
    description: 'Comprehensive coverage with a diminishing deductible reward.',
    features: ['Wellness rewards program', 'Diminishing deductible', 'Covers exam fees'],
    url: process.env.NEXT_PUBLIC_EMBRACE_AFFILIATE_URL || 'https://www.embracepetinsurance.com',
    logo: '🤗',
    highlight: 'Best Wellness Add-Ons',
  },
  {
    name: 'Pets Best',
    description: 'Affordable plans with flexible coverage options.',
    features: ['Budget-friendly options', 'Direct vet payment', '24/7 pet helpline'],
    url: process.env.NEXT_PUBLIC_PETSBEST_AFFILIATE_URL || 'https://www.petsbest.com',
    logo: '⭐',
    highlight: 'Best Budget Option',
  },
  {
    name: 'Trupanion',
    description: 'Pay at the vet with direct hospital payments.',
    features: ['90% coverage', 'No payout limits', 'Direct vet payment'],
    url: process.env.NEXT_PUBLIC_TRUPANION_AFFILIATE_URL || 'https://www.trupanion.com',
    logo: '🏥',
    highlight: 'Best for Direct Vet Pay',
  },
]

// Pet medication/pharmacy providers
export const petPharmacyProviders = [
  {
    name: 'Chewy Pharmacy',
    description: 'Licensed pharmacy with vet prescription management.',
    url: getChewyPharmacyUrl(),
    logo: '💊',
    color: 'bg-blue-500',
  },
  {
    name: '1-800-PetMeds',
    description: 'America\'s largest pet pharmacy.',
    url: process.env.NEXT_PUBLIC_1800PETMEDS_AFFILIATE_URL || 'https://www.1800petmeds.com',
    logo: '💉',
    color: 'bg-green-500',
  },
  {
    name: 'PetCareRx',
    description: 'Discount pet medications and supplies.',
    url: process.env.NEXT_PUBLIC_PETCARERX_AFFILIATE_URL || 'https://www.petcarerx.com',
    logo: '🩺',
    color: 'bg-purple-500',
  },
  {
    name: 'Amazon Pet Pharmacy',
    description: 'Convenient delivery with Prime benefits.',
    url: getAmazonPharmacyUrl(),
    logo: '📦',
    color: 'bg-orange-500',
  },
]
