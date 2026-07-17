export interface Country {
  name: string
  iso2: string
  dial: string
}

/** Regional indicator symbols render as the country's flag in modern browsers. */
export const flagFor = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))

// Nigeria first — this app defaults new users to NGN / Nigerian businesses.
export const COUNTRIES: Country[] = [
  { name: 'Nigeria', iso2: 'NG', dial: '+234' },
  { name: 'Ghana', iso2: 'GH', dial: '+233' },
  { name: 'Kenya', iso2: 'KE', dial: '+254' },
  { name: 'South Africa', iso2: 'ZA', dial: '+27' },
  { name: 'Egypt', iso2: 'EG', dial: '+20' },
  { name: 'Ethiopia', iso2: 'ET', dial: '+251' },
  { name: 'Tanzania', iso2: 'TZ', dial: '+255' },
  { name: 'Uganda', iso2: 'UG', dial: '+256' },
  { name: 'Rwanda', iso2: 'RW', dial: '+250' },
  { name: 'Senegal', iso2: 'SN', dial: '+221' },
  { name: "Côte d'Ivoire", iso2: 'CI', dial: '+225' },
  { name: 'Cameroon', iso2: 'CM', dial: '+237' },
  { name: 'Morocco', iso2: 'MA', dial: '+212' },
  { name: 'Algeria', iso2: 'DZ', dial: '+213' },
  { name: 'Zambia', iso2: 'ZM', dial: '+260' },
  { name: 'Zimbabwe', iso2: 'ZW', dial: '+263' },
  { name: 'United States', iso2: 'US', dial: '+1' },
  { name: 'Canada', iso2: 'CA', dial: '+1' },
  { name: 'United Kingdom', iso2: 'GB', dial: '+44' },
  { name: 'Ireland', iso2: 'IE', dial: '+353' },
  { name: 'Germany', iso2: 'DE', dial: '+49' },
  { name: 'France', iso2: 'FR', dial: '+33' },
  { name: 'Spain', iso2: 'ES', dial: '+34' },
  { name: 'Italy', iso2: 'IT', dial: '+39' },
  { name: 'Portugal', iso2: 'PT', dial: '+351' },
  { name: 'Netherlands', iso2: 'NL', dial: '+31' },
  { name: 'Belgium', iso2: 'BE', dial: '+32' },
  { name: 'Switzerland', iso2: 'CH', dial: '+41' },
  { name: 'Sweden', iso2: 'SE', dial: '+46' },
  { name: 'Norway', iso2: 'NO', dial: '+47' },
  { name: 'Denmark', iso2: 'DK', dial: '+45' },
  { name: 'Poland', iso2: 'PL', dial: '+48' },
  { name: 'United Arab Emirates', iso2: 'AE', dial: '+971' },
  { name: 'Saudi Arabia', iso2: 'SA', dial: '+966' },
  { name: 'Qatar', iso2: 'QA', dial: '+974' },
  { name: 'Turkey', iso2: 'TR', dial: '+90' },
  { name: 'India', iso2: 'IN', dial: '+91' },
  { name: 'Pakistan', iso2: 'PK', dial: '+92' },
  { name: 'China', iso2: 'CN', dial: '+86' },
  { name: 'Japan', iso2: 'JP', dial: '+81' },
  { name: 'South Korea', iso2: 'KR', dial: '+82' },
  { name: 'Singapore', iso2: 'SG', dial: '+65' },
  { name: 'Malaysia', iso2: 'MY', dial: '+60' },
  { name: 'Indonesia', iso2: 'ID', dial: '+62' },
  { name: 'Philippines', iso2: 'PH', dial: '+63' },
  { name: 'Australia', iso2: 'AU', dial: '+61' },
  { name: 'New Zealand', iso2: 'NZ', dial: '+64' },
  { name: 'Brazil', iso2: 'BR', dial: '+55' },
  { name: 'Mexico', iso2: 'MX', dial: '+52' },
  { name: 'Argentina', iso2: 'AR', dial: '+54' },
]

export const DEFAULT_COUNTRY = COUNTRIES[0]

export const findCountryByDial = (dial: string) =>
  COUNTRIES.find((c) => c.dial === dial)

export const splitPhone = (phone: string | null | undefined): { country: Country; number: string } => {
  if (!phone) return { country: DEFAULT_COUNTRY, number: '' }
  const match = phone.match(/^(\+\d{1,4})\s*(.*)$/)
  if (!match) return { country: DEFAULT_COUNTRY, number: phone }
  const country = findCountryByDial(match[1]) ?? DEFAULT_COUNTRY
  return { country, number: match[2] }
}
