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
        maxW="7xl"
        color={fontColor ? color(fontColor) : undefined}
        pt="110px"
        pb="110px"
      >
        {children}
      </Container>
    </chakra.div>
  );
}
