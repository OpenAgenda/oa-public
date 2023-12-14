import Navbar from './Navbar';
import Announcement from './Announcement';

type LayoutProps = {
  children: React.ReactNode
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <Announcement />
      {children}
    </>
  );
}
