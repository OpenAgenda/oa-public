import Link from 'next/link';
import { Button, ButtonProps } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';

interface CTAButtonProps {
  link: string;
  label: string;
  fontColor?: Color;
  backgroundColor?: Color;
  colorPalette?: Color;
  variant?: ButtonProps['variant'];
}

export default function CTAButton({
  link,
  label,
  colorPalette,
  variant,
}: CTAButtonProps) {
  return (
    <Button
      asChild
      colorPalette={
        colorPalette
          ? color(colorPalette?.name).replace('strapi.', 'strapi.flashy.')
          : 'strapi.flashy.blueViolet'
      }
      size="lg"
      variant={variant}
    >
      <Link href={link}>{label}</Link>
    </Button>
  );
}
