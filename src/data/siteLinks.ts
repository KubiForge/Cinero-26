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
  { label: 'Our Purpose', href: '#about-purpose' },
  { label: 'Registration Portal', href: '#register' },
] as const;

export const contactEmail = {
  address: 'sathirasugeesvara@gmail.com',
  href: 'mailto:cinero2026@gmail.com',
} as const;

export const contactPhone = {
  number: '+94 768071233',
} as const;

export const getContactPhoneHref = (number: string) => {
  const dialableNumber = number.replace(/[^\d+]/g, '');
  return dialableNumber ? `tel:${dialableNumber}` : '';
};

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/JapuraVoice', platform: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/japura_voice', platform: 'instagram' },
  { label: 'YouTube', href: 'https://youtube.com/@voicetvbyjapuravoice', platform: 'youtube' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/j-pura-voice', platform: 'linkedin' },
] as const;

export type SocialPlatform = (typeof socialLinks)[number]['platform'];
