import { Button } from '@openagenda/uikit';
import NextChakraLink from 'components/NextChakraLink';
import { color } from 'utils/strapi';
interface Color {
  name: string;
  swatch?: string;
}

interface CTAButtonProps {
  link: string;
  label: string;
  fontColor?: Color;
  backgroundColor?: Color;
}

export default function CTAButton({
  link,
  label,
  fontColor,
  backgroundColor,
}: CTAButtonProps) {
  return (
    <Button
      as={NextChakraLink}
      href={link}
      colorScheme={backgroundColor ? undefined : 'primary'}
      borderColor={backgroundColor ? color(backgroundColor) : undefined}
      bg={backgroundColor ? color(backgroundColor) : undefined}
      color={color(fontColor)}
    >
      {label}
    </Button>
  );
}
