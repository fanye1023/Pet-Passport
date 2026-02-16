// Popular pet food brands with their domains for logo fetching
// Logo URL: https://logo.clearbit.com/{domain}

export interface PetFoodBrand {
  name: string
  domain: string
}

export const petFoodBrands: PetFoodBrand[] = [
  // Premium Brands
  { name: 'Acana', domain: 'acana.com' },
  { name: 'Addiction', domain: 'addictionfoods.com' },
  { name: 'Almo Nature', domain: 'almonature.com' },
  { name: 'American Journey', domain: 'chewy.com' },
  { name: 'Annamaet', domain: 'annamaet.com' },
  { name: 'Applaws', domain: 'applaws.com' },
  { name: 'Blackwood', domain: 'blackwoodpetfood.com' },
  { name: 'Blue Buffalo', domain: 'bluebuffalo.com' },
  { name: 'Blue Buffalo Wilderness', domain: 'bluebuffalo.com' },
  { name: 'Canidae', domain: 'canidae.com' },
  { name: 'Earthborn Holistic', domain: 'earthbornholisticpetfood.com' },
  { name: 'Evangers', domain: 'evangersdogfood.com' },
  { name: 'Farmina', domain: 'farmina.com' },
  { name: 'FirstMate', domain: 'firstmate.com' },
  { name: 'Fromm', domain: 'frommfamily.com' },
  { name: 'Gathering', domain: 'gatheringpetfood.com' },
  { name: 'Go! Solutions', domain: 'petcurean.com' },
  { name: 'Grandma Lucy\'s', domain: 'grandmalucys.com' },
  { name: 'Holistic Select', domain: 'holisticselect.com' },
  { name: 'Hound & Gatos', domain: 'houndgatos.com' },
  { name: 'I and Love and You', domain: 'iandloveandyou.com' },
  { name: 'Instinct', domain: 'instinctpetfood.com' },
  { name: 'Koha', domain: 'kohapetfood.com' },
  { name: 'Lotus', domain: 'lotuspetfoods.com' },
  { name: 'Merrick', domain: 'merrickpetcare.com' },
  { name: 'NutriSource', domain: 'nutrisourcepetfoods.com' },
  { name: 'Nulo', domain: 'nulo.com' },
  { name: 'Nutro', domain: 'nutro.com' },
  { name: 'Open Farm', domain: 'openfarmpet.com' },
  { name: 'Orijen', domain: 'orijen.ca' },
  { name: 'Petcurean Now Fresh', domain: 'petcurean.com' },
  { name: 'Primal', domain: 'primalpetfoods.com' },
  { name: 'Solid Gold', domain: 'solidgoldpet.com' },
  { name: 'Stella & Chewy\'s', domain: 'stellaandchewys.com' },
  { name: 'Taste of the Wild', domain: 'tasteofthewildpetfood.com' },
  { name: 'The Honest Kitchen', domain: 'thehonestkitchen.com' },
  { name: 'Tuscan Natural', domain: 'tuscannatural.com' },
  { name: 'Wellness', domain: 'wellnesspetfood.com' },
  { name: 'Wellness CORE', domain: 'wellnesspetfood.com' },
  { name: 'Wholesome', domain: 'wholesomepetfood.com' },
  { name: 'Wild Earth', domain: 'wildearth.com' },
  { name: 'Zignature', domain: 'zignature.com' },
  { name: 'Zinpro', domain: 'zinpro.com' },

  // Major Brands
  { name: 'Alpo', domain: 'purina.com' },
  { name: 'Beneful', domain: 'purina.com' },
  { name: 'Cesar', domain: 'cesar.com' },
  { name: 'Dog Chow', domain: 'purina.com' },
  { name: 'Eukanuba', domain: 'eukanuba.com' },
  { name: 'Gravy Train', domain: 'jmsmucker.com' },
  { name: 'Hill\'s Science Diet', domain: 'hillspet.com' },
  { name: 'Iams', domain: 'iams.com' },
  { name: 'Nutri Chunks', domain: 'nutrichunks.com' },
  { name: 'Ol\' Roy', domain: 'walmart.com' },
  { name: 'Pedigree', domain: 'pedigree.com' },
  { name: 'Purina', domain: 'purina.com' },
  { name: 'Purina Beyond', domain: 'purina.com' },
  { name: 'Purina Dog Chow', domain: 'purina.com' },
  { name: 'Purina ONE', domain: 'purina.com' },
  { name: 'Purina Pro Plan', domain: 'purina.com' },
  { name: 'Royal Canin', domain: 'royalcanin.com' },
  { name: 'Sportmix', domain: 'sportmix.com' },
  { name: 'Victor', domain: 'victorpetfood.com' },

  // Natural/Organic Brands
  { name: 'Castor & Pollux', domain: 'castorpolluxpet.com' },
  { name: 'Halo', domain: 'halopets.com' },
  { name: 'Natural Balance', domain: 'naturalbalanceinc.com' },
  { name: 'Nature\'s Logic', domain: 'natureslogic.com' },
  { name: 'Nature\'s Recipe', domain: 'naturesrecipe.com' },
  { name: 'Nature\'s Variety', domain: 'instinctpetfood.com' },
  { name: 'Newman\'s Own', domain: 'newmansown.com' },
  { name: 'Only Natural Pet', domain: 'onlynaturalpet.com' },
  { name: 'Organix', domain: 'castorpolluxpet.com' },
  { name: 'Tender & True', domain: 'tenderandtruepet.com' },
  { name: 'Whole Earth Farms', domain: 'merrickpetcare.com' },

  // Value Brands
  { name: 'Diamond', domain: 'diamondpet.com' },
  { name: 'Diamond Naturals', domain: 'diamondpet.com' },
  { name: 'Kibbles \'n Bits', domain: 'jmsmucker.com' },
  { name: 'Pup-Peroni', domain: 'jmsmucker.com' },
  { name: 'Rachael Ray Nutrish', domain: 'nutrish.com' },
  { name: 'Special Kitty', domain: 'walmart.com' },

  // Specialty/Prescription
  { name: 'Hill\'s Prescription Diet', domain: 'hillspet.com' },
  { name: 'Purina Pro Plan Veterinary', domain: 'purina.com' },
  { name: 'Royal Canin Veterinary', domain: 'royalcanin.com' },
  { name: 'Blue Buffalo Natural Veterinary', domain: 'bluebuffalo.com' },
  { name: 'Rayne Clinical Nutrition', domain: 'raynenutrition.com' },

  // Fresh/Delivery Brands
  { name: 'A Pup Above', domain: 'apupabove.com' },
  { name: 'Butternut Box', domain: 'butternutbox.com' },
  { name: 'Cali Raw', domain: 'calirawdog.com' },
  { name: 'Farmer\'s Dog', domain: 'thefarmersdog.com' },
  { name: 'Freshpet', domain: 'freshpet.com' },
  { name: 'JustFoodForDogs', domain: 'justfoodfordogs.com' },
  { name: 'Kabo', domain: 'kabo.co' },
  { name: 'Maev', domain: 'meetmaev.com' },
  { name: 'My Ollie', domain: 'myollie.com' },
  { name: 'Nom Nom', domain: 'nomnomnow.com' },
  { name: 'Ollie', domain: 'myollie.com' },
  { name: 'Open Farm Freeze Dried', domain: 'openfarmpet.com' },
  { name: 'PetPlate', domain: 'petplate.com' },
  { name: 'Raised Right', domain: 'raisedrightpets.com' },
  { name: 'Spot & Tango', domain: 'spotandtango.com' },
  { name: 'Sundays', domain: 'sundaysfordogs.com' },
  { name: 'We Feed Raw', domain: 'wefeedraw.com' },

  // Raw/Freeze-Dried Brands
  { name: 'Answers Pet Food', domain: 'answerspetfood.com' },
  { name: 'Big Country Raw', domain: 'bigcountryraw.com' },
  { name: 'Bravo', domain: 'bfrbrands.com' },
  { name: 'Darwin\'s Natural Pet', domain: 'darwinspet.com' },
  { name: 'K9 Natural', domain: 'k9natural.com' },
  { name: 'Northwest Naturals', domain: 'nw-naturals.net' },
  { name: 'OC Raw Dog', domain: 'ocrawdog.com' },
  { name: 'Rad Cat', domain: 'radfood.com' },
  { name: 'Raw Bistro', domain: 'rawbistro.com' },
  { name: 'Raw Paws', domain: 'rawpawspetfood.com' },
  { name: 'Smallbatch', domain: 'smallbatchpets.com' },
  { name: 'Steve\'s Real Food', domain: 'stevesrealfood.com' },
  { name: 'Vital Essentials', domain: 'vitalessentialsraw.com' },
  { name: 'Ziwi Peak', domain: 'ziwipets.com' },

  // Cat-Specific Brands
  { name: '9Lives', domain: 'jmsmucker.com' },
  { name: 'Blue Buffalo Tastefuls', domain: 'bluebuffalo.com' },
  { name: 'Cat Chow', domain: 'purina.com' },
  { name: 'Fancy Feast', domain: 'purina.com' },
  { name: 'Feline Natural', domain: 'k9natural.com' },
  { name: 'Friskies', domain: 'purina.com' },
  { name: 'Kit & Kaboodle', domain: 'purina.com' },
  { name: 'Meow Mix', domain: 'meowmix.com' },
  { name: 'Sheba', domain: 'sheba.com' },
  { name: 'Smalls', domain: 'smalls.com' },
  { name: 'Temptations', domain: 'temptationstreats.com' },
  { name: 'Tiki Cat', domain: 'tikipets.com' },
  { name: 'Tiki Pets', domain: 'tikipets.com' },
  { name: 'Weruva', domain: 'weruva.com' },
  { name: 'Whiskas', domain: 'whiskas.com' },

  // Treats Brands
  { name: 'Bocce\'s Bakery', domain: 'boccesbakery.com' },
  { name: 'Greenies', domain: 'greenies.com' },
  { name: 'Milk-Bone', domain: 'milkbone.com' },
  { name: 'Old Mother Hubbard', domain: 'wellnesspetfood.com' },
  { name: 'Zuke\'s', domain: 'zukes.com' },

  // Store Brands
  { name: '4Health (Tractor Supply)', domain: 'tractorsupply.com' },
  { name: 'Authority (PetSmart)', domain: 'petsmart.com' },
  { name: 'Costco Kirkland', domain: 'costco.com' },
  { name: 'Great Choice (PetSmart)', domain: 'petsmart.com' },
  { name: 'Member\'s Mark (Sam\'s Club)', domain: 'samsclub.com' },
  { name: 'Pure Balance (Walmart)', domain: 'walmart.com' },
  { name: 'Simply Nourish (PetSmart)', domain: 'petsmart.com' },
  { name: 'Trader Joe\'s', domain: 'traderjoes.com' },
  { name: 'Wegmans', domain: 'wegmans.com' },
  { name: 'Wholehearted (Petco)', domain: 'petco.com' },
  { name: 'Whole Foods 365', domain: 'wholefoodsmarket.com' },
]

// Common protein/flavor variants
export const productVariants = [
  'Chicken',
  'Chicken & Rice',
  'Chicken & Brown Rice',
  'Beef',
  'Beef & Rice',
  'Salmon',
  'Salmon & Rice',
  'Fish',
  'Whitefish',
  'Ocean Fish',
  'Turkey',
  'Turkey & Rice',
  'Lamb',
  'Lamb & Rice',
  'Duck',
  'Venison',
  'Bison',
  'Rabbit',
  'Pork',
  'Mixed Protein',
  // Diet Types
  'Grain-Free Chicken',
  'Grain-Free Salmon',
  'Grain-Free Beef',
  'Limited Ingredient',
  'Sensitive Stomach',
  'Weight Management',
  'Indoor Formula',
  'Hairball Control',
  'Urinary Health',
  'Joint Health',
  'Puppy',
  'Kitten',
  'Senior',
  'Adult',
  'Small Breed',
  'Large Breed',
]

// Helper to get logo URL
export function getBrandLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`
}

// Helper to find brand by name
export function findBrand(name: string): PetFoodBrand | undefined {
  return petFoodBrands.find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  )
}

// Helper to search brands
export function searchBrands(query: string): PetFoodBrand[] {
  const lowerQuery = query.toLowerCase()
  return petFoodBrands.filter((b) =>
    b.name.toLowerCase().includes(lowerQuery)
  )
}
