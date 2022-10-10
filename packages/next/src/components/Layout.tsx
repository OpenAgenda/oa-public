import { Container } from '@openagenda/uikit';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py="2">
        {children}
      </Container>
    </>
  );
}
