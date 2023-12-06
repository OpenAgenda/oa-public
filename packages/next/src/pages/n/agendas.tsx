import { GetStaticProps } from 'next';
import { NextPageWithLayout } from 'pages/_app';
import AgendasSearch from 'views/AgendasSearch';
import Layout from 'components/Layout';
import { NavbarSearchProvider } from 'contexts/NavbarSearchManager';

type PageProps = {
  intlMessages?: Record<string, string>;
};

// export const getServerSideProps: GetServerSideProps = async ({
//   req,
//   // res,
//   locale: nextLocale,
//   // query: queryWithParams,
//   resolvedUrl,
// }) => {
//   const query = parseLocationQuery(resolvedUrl);
//
//   const locale = getPreferredLocale(query.lang, nextLocale, getSession(req.cookies)?.user?.culture);
//
//   const props: PageProps = {
//     intlMessages: await AgendasSearch.fetchLocale(locale),
//   };
//
//   return { props };
// };

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const props: PageProps = {
    intlMessages: await AgendasSearch.fetchLocale(locale),
  };

  return { props };
};

const AgendasPage: NextPageWithLayout<PageProps> = _props => (
  <AgendasSearch />
);

// eslint-disable-next-line react/display-name
AgendasPage.Layout = ({ children }) => (
  <NavbarSearchProvider>
    <Layout>
      {children}
    </Layout>
  </NavbarSearchProvider>
);

export default AgendasPage;
