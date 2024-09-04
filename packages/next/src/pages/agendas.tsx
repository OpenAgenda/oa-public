import { GetServerSideProps } from 'next';
import qs from 'qs';
import { NextPageWithLayout } from 'pages/_app';
import AgendasSearch, { AgendasSearchProps } from 'views/AgendasSearch';
import Layout from 'components/Layout';
import { NavbarSearchProvider } from 'contexts/NavbarSearchManager';
import parseLocationQuery from 'utils/parseLocationQuery';

type PageProps = AgendasSearchProps & {
  intlMessages?: Record<string, string>;
};

export const getServerSideProps: GetServerSideProps = async ({
  // req,
  // res,
  locale,
  // query,
  resolvedUrl,
}) => {
  const query = parseLocationQuery(resolvedUrl) as {
    search?: string;
    network?: string;
    locationSet?: string;
    after?: string[];
  };

  const agendasUrl = `/api/agendas${qs.stringify(
    {
      ...query,
      after: query.after?.map(String),
      includeImagePath: 0,
      useDefaultImage: 0,
      fields: ['summary', 'network', 'locationSet'],
    },
    {
      addQueryPrefix: true,
    },
  )}`;

  const intlMessages = await AgendasSearch.fetchLocale(locale);

  const props: PageProps = {
    intlMessages,
    preload: [agendasUrl]
      .concat(query.network ? `/api/networks/${query.network}` : [])
      .concat(
        query.locationSet ? `/api/locationSets/${query.locationSet}` : [],
      ),
  };

  return { props };
};

const AgendasPage: NextPageWithLayout<PageProps> = (props) => (
  <AgendasSearch {...props} />
);

// eslint-disable-next-line react/display-name
AgendasPage.Layout = ({ children }) => (
  <NavbarSearchProvider>
    <Layout>{children}</Layout>
  </NavbarSearchProvider>
);

export default AgendasPage;
