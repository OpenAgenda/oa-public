import { Flex, ButtonProps } from '@openagenda/uikit';
import CTAButton from './CTAButton';
import type { Color } from './types';

interface CTAButtonsProps {
  CTAs?: Array<{
    link: string;
    label: string;
    color?: Color;
    variant?: ButtonProps['variant'];
  }>;
  mt?: number;
  justify?: any;
  size?: ButtonProps['size'];
}

export default function CTAButtons({
  CTAs,
  justify,
  size = 'lg',
  mt,
}: CTAButtonsProps) {
  if (!CTAs || CTAs.length === 0) {
    return null;
  }

  return (
    <Flex gap={4} wrap="wrap" justify={justify} mt={mt}>
      {CTAs.map((cta, index) => (
        <CTAButton
          key={index}
          link={cta.link}
          label={cta.label}
          color={cta.color}
          variant={cta.variant}
          size={size}
        />
      ))}
    </Flex>
  );
}
