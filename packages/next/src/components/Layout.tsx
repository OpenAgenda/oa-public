import { Container } from '@openagenda/uikit';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py="4">
        {children}
      </Container>
    </>
  );
}
