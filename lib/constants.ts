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

// Shopping link helpers
export function getAmazonSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant} pet food` : `${brand} pet food`
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
}

export function getChewySearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  return `https://www.chewy.com/s?query=${encodeURIComponent(query)}`
}

export function getPetcoSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  return `https://www.petco.com/shop/en/petcostore/search?query=${encodeURIComponent(query)}`
}

export function getPetSmartSearchUrl(brand: string, variant?: string) {
  const query = variant ? `${brand} ${variant}` : brand
  return `https://www.petsmart.com/search/?q=${encodeURIComponent(query)}`
}
