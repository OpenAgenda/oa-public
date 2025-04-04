import { Button } from '@openagenda/uikit';
import NextChakraLink from 'components/NextChakraLink';
interface Color {
  name: string;
  swatch?: string;
}

interface CTAButtonProps {
  link: string;
  label: string;
  fontColor?: Color;
  backgroundColor?: Color;
  colorScheme?: Color;
  variant?: string;
}

export default function CTAButton({
  link,
  label,
  colorScheme,
  variant,
}: CTAButtonProps) {
  return (
    <Button
      as={NextChakraLink}
      href={link}
      colorScheme={colorScheme ? colorScheme.name : 'primary'}
      size="lg"
      variant={variant}
      fontSize="xl"
    >
      {label}
    </Button>
  );
}
