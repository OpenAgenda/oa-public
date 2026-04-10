import getLocale from 'app/utils/getLocale';
import { fetchAgendas, fetchNetwork, fetchLocationSet } from './api';
import AgendasSearch from './AgendasSearch';

type AgendasContentProps = {
  searchParams: {
    search?: string;
    network?: string;
    locationSet?: string;
  };
};

export default async function AgendasContent({
  searchParams: params,
}: AgendasContentProps) {
  const locale = await getLocale();

  const query = {
    search: params.search,
    network: params.network,
    locationSet: params.locationSet,
  };

  const [initialAgendas, network, locationSet] = await Promise.all([
    fetchAgendas(query).catch(() => null),
    query.network ? fetchNetwork(query.network).catch(() => null) : null,
    query.locationSet
      ? fetchLocationSet(query.locationSet).catch(() => null)
      : null,
  ]);

  return (
    <AgendasSearch
      initialAgendas={initialAgendas}
      network={network}
      locationSet={locationSet}
      query={query}
      locale={locale}
    />
  );
}
