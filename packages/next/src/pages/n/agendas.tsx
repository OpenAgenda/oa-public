import { GetServerSideProps } from 'next';
import qs from 'qs';
import { SWRConfig, unstable_serialize as unstableSerialize } from 'swr';
import VError from '@openagenda/verror';
import { NextPageWithLayout } from 'pages/_app';
import AgendasSearch from 'views/AgendasSearch';
import Layout from 'components/Layout';
import { NavbarSearchProvider } from 'contexts/NavbarSearchManager';
import parseLocationQuery from 'utils/parseLocationQuery';

type PageProps = {
  intlMessages?: Record<string, string>;
  fallback?: any
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  // res,
  locale,
  // query,
  resolvedUrl,
}) => {
  const query = parseLocationQuery(resolvedUrl) as {
    search?: string
    network?: string
    locationSet?: string
    after?: string[]
  };

  const agendasUrl = `/api/agendas${qs.stringify({
    ...query,
    after: query.after?.map(String),
    includeImagePath: 0,
    useDefaultImage: 0,
    fields: ['summary', 'network', 'locationSet'],
  }, {
    addQueryPrefix: true,
  })}`;

  const [
    intlMessages,
    agendas,
    network,
    locationSet,
  ] = await Promise.all([
    AgendasSearch.fetchLocale(locale),
    fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}${agendasUrl}`, {
      headers: {
        Cookie: req.headers.cookie,
        Authorization: req.headers.authorization,
      },
    }).then(r => {
      if (r.ok) return r.json();
      throw new VError[r.status](r.statusText);
    }),
    query.network
      ? fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/networks/${query.network}`, {
        headers: {
          Cookie: req.headers.cookie,
          Authorization: req.headers.authorization,
        },
      }).then(r => {
        if (r.ok) return r.json();
        throw new VError[r.status](r.statusText);
      })
      : null,
    query.locationSet
      ? fetch(`${process.env.NEXT_API_INTERNAL_BASE_URL}/api/locationSets/${query.locationSet}`, {
        headers: {
          Cookie: req.headers.cookie,
          Authorization: req.headers.authorization,
        },
      }).then(r => {
        if (r.ok) return r.json();
        throw new VError[r.status](r.statusText);
      })
      : null,
  ]);

  const props: PageProps = {
    intlMessages,
    fallback: {
      [`$inf$${unstableSerialize(['AgendasSearch', 'agendas', {
        search: query.search ?? '',
        network: query.network,
        locationSet: query.locationSet,
      }, 0, query.after])}`]: [agendas],
    },
  };

  if (query.network) {
    props.fallback[`/api/networks/${query.network}`] = network;
  }

  if (query.network) {
    props.fallback[`/api/locationSet/${query.locationSet}`] = locationSet;
  }

  return { props };
};

const AgendasPage: NextPageWithLayout<PageProps> = props => {
  const { fallback = {} } = props;

  return (
    <SWRConfig value={{ fallback }}>
      <AgendasSearch />
    </SWRConfig>
  );
};

// eslint-disable-next-line react/display-name
AgendasPage.Layout = ({ children }) => (
  <NavbarSearchProvider>
    <Layout>
      {children}
    </Layout>
  </NavbarSearchProvider>
);

export default AgendasPage;
