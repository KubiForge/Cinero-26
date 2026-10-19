import type { ImgHTMLAttributes } from 'react';

type BrandLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'width' | 'height'
>;

export default function BrandLogo(props: BrandLogoProps) {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet="/images/cinero-logo-960.5475206007.webp 960w"
        sizes="460px"
      />
      <img src="/images/cinero-logo.png" width={1600} height={340} {...props} />
    </picture>
  );
}
