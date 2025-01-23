import { Container } from '@openagenda/uikit';

export default function PageContainerDecorator(Story) {
  return (
    <Container maxW="8xl" height="100%">
      <Story />
    </Container>
  );
}
