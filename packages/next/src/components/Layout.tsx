import { Container } from '@openagenda/uikit';
import Navbar from './Navbar';

type LayoutProps = {
  children: React.ReactNode
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py="2">
        {children}
      </Container>
    </>
  );
}
