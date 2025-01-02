import { Button } from '@openagenda/uikit';
import NextChakraLink from 'components/NextChakraLink';

interface CTAButtonProps {
  link: string;
  label: string;
}

export default function CTAButton({ link, label }: CTAButtonProps) {
  return (
    <Button as={NextChakraLink} href={link} colorScheme="primary">
      {label}
    </Button>
  );
}
