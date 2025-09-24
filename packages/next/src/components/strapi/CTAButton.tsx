import Link from 'next/link';
import { Button, ButtonProps } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';

interface CTAButtonProps {
  link: string;
  label: string;
  color?: Color;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

export default function CTAButton({
  link,
  label,
  color: buttonColor,
  variant,
  size,
}: CTAButtonProps) {
  return (
    <Button
      asChild
      color={buttonColor?.name === 'white' ? 'white' : undefined}
      colorPalette={buttonColor ? color(buttonColor) : 'strapi.frenchBlue'}
      size={size || 'lg'}
      variant={variant}
    >
      <Link href={link}>{label}</Link>
    </Button>
  );
}
