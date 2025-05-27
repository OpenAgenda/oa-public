import Link from 'next/link';
import { Button, ButtonProps } from '@openagenda/uikit';
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
      colorPalette={colorPalette ? colorPalette.name : 'primary'}
      size="lg"
      variant={variant}
      mt={9}
    >
      <Link href={link}>{label}</Link>
    </Button>
  );
}
