import Link from 'next/link';
import { Button, ButtonProps } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';

interface CTAButtonProps {
  link: string;
  label: string;
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
      color={colorPalette?.name === 'white' ? 'white' : undefined}
      colorPalette={colorPalette ? color(colorPalette) : 'strapi.frenchBlue'}
      size="lg"
      variant={variant}
    >
      <Link href={link}>{label}</Link>
    </Button>
  );
}
