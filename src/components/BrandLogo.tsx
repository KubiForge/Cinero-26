import type { ImgHTMLAttributes } from 'react';

type BrandLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'width' | 'height'
> & {
  variant?: 'withCaption' | 'withoutCaption';
};

export default function BrandLogo({
  variant = 'withCaption',
  sizes = '(max-width: 768px) 72vw, 460px',
  ...props
}: BrandLogoProps) {
  const hasCaption = variant === 'withCaption';
  const logoName = hasCaption ? 'cinero-logo-with-caption' : 'cinero-logo-no-caption';

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`/images/${logoName}-320.webp 320w, /images/${logoName}-640.webp 640w, /images/${logoName}-960.webp 960w`}
        sizes={sizes}
      />
      <img
        src={`/images/${logoName}-optimized.png`}
        width={960}
        height={hasCaption ? 234 : 193}
        {...props}
      />
    </picture>
  );
}
