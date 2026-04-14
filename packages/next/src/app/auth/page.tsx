import { Container } from '@openagenda/uikit';
import Signin from 'components/auth/Signin';

export default function AuthPage() {
  return (
    <Container maxW="sm" mt="10">
      <Signin />
    </Container>
  );
}
