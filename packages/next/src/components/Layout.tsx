import Navbar from './Navbar';
import Announcement from './Announcement';
import FlashAlert from './FlashAlert';

type LayoutProps = {
  children: React.ReactNode
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <Announcement />
      <FlashAlert />
      {children}
    </>
  );
}
