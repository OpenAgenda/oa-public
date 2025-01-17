import { Container, chakra } from '@openagenda/uikit';
import { color } from 'utils/strapi';

interface SegmentContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  fontColor?: string;
}

export default function SegmentContainer({
  children,
  backgroundColor,
  fontColor,
}: SegmentContainerProps) {
  return (
    <chakra.div
      backgroundColor={backgroundColor ? color(backgroundColor) : undefined}
    >
      <Container
        maxW="8xl"
        color={fontColor ? color(fontColor) : undefined}
        pt={4}
        pb={4}
      >
        {children}
      </Container>
    </chakra.div>
  );
}
