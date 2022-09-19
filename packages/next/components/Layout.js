import Navbar from './Navbar';

import {
  Container
} from '@openagenda/uikit';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={{ base: '4', lg: '4' }}>
        {children}
      </Container>
    </>
  )
}
