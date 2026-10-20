export const siteNavigationLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Guidelines', href: '#guidelines' },
  { label: 'Contact', href: '#contact' },
] as const;

export const footerCategoryLinks = [
  { label: 'Inter-University', href: '#guidelines-university' },
  { label: 'Inter-School', href: '#guidelines-school' },
  { label: 'Awards & Recognition', href: '#about' },
  { label: 'Registration Portal', href: '#register' },
] as const;

export const contactEmail = {
  address: 'sathirasugeesvara@gmail.com',
  href: 'mailto:sathirasugeesvara@gmail.com',
} as const;

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/JapuraVoice', platform: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/japura_voice', platform: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com', platform: 'youtube' },
  { label: 'LinkedIn', href: 'https://linkedin.com', platform: 'linkedin' },
] as const;

export type SocialPlatform = (typeof socialLinks)[number]['platform'];
