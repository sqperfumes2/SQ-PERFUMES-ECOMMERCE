export const featuredReviews = [
  {
    id: 'rev-ayesha',
    customerName: 'Ayesha Khan',
    city: 'Karachi',
    rating: 5,
    title: 'Lasts through the night',
    body: 'Soft, polished, and it stays on fabric through dinner. Ordered COD and the bottle arrived perfectly packed.',
    locale: 'en',
  },
  {
    id: 'rev-hassan',
    customerName: 'Hassan Raza',
    city: 'Lahore',
    rating: 5,
    title: 'بہترین خوشبو',
    body: 'خوشبو بہت دیر تک رہتی ہے۔ شام کی محفل میں پہنی تو سب نے پوچھا کون سی پرفیوم ہے۔',
    locale: 'ur',
  },
  {
    id: 'rev-fatima',
    customerName: 'Fatima Noor',
    city: 'Islamabad',
    rating: 4,
    title: 'Refined, not loud',
    body: 'Elegant trail without being heavy. Would love a travel size next, but this bottle is already a staple on my dresser.',
    locale: 'en',
  },
  {
    id: 'rev-sana',
    customerName: 'Sana Sheikh',
    city: 'Multan',
    rating: 5,
    title: 'بالکل ویسا ہی',
    body: 'پیکنگ بہت اچھی تھی اور پرفیوم بالکل ویسا ہی نکلا جیسا امید تھی۔ روزمرہ کے لیے ہلکی اور کلاسکی خوشبو ہے۔',
    locale: 'ur',
  },
  {
    id: 'rev-usman',
    customerName: 'Usman Malik',
    city: 'Faisalabad',
    rating: 5,
    title: 'Perfect for Eid',
    body: 'Bought it as an Eid gift for myself. Compliments all evening, and delivery to Faisalabad was quick.',
    locale: 'en',
  },
  {
    id: 'rev-ali',
    customerName: 'Ali Haider',
    city: 'Peshawar',
    rating: 5,
    title: 'کوآلیٹی زبردست',
    body: 'کیش آن ڈیلیوری آسان تھا اور ڈیلیوری وقت پر مل گئی۔ کوآلیٹی بے مثال ہے، دوبارہ ضرور منگواؤں گا۔',
    locale: 'ur',
  },
]

export function reviewInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function mergeStorefrontReviews(apiReviews = [], limit = 6) {
  const featured = featuredReviews
  if (!apiReviews.length) return featured.slice(0, limit)

  const merged = []
  const seen = new Set()

  for (const review of apiReviews) {
    const key = review._id || review.id || review.customerName
    if (seen.has(key)) continue
    seen.add(key)
    merged.push({
      ...review,
      locale: review.locale || 'en',
    })
    if (merged.length >= limit) return merged
  }

  for (const review of featured) {
    if (seen.has(review.customerName) || seen.has(review.id)) continue
    merged.push(review)
    if (merged.length >= limit) break
  }

  return merged
}
