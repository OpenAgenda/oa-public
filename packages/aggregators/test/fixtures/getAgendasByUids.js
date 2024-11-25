import agendas from './review.data.json';

export default async (uids = [], options = {}) => {
  const { search = null, slug = null } = options;

  return agendas
    .filter((a) => uids.includes(a.uid))
    .filter((a) => (search ? a.title.includes(search) : true))
    .filter((a) => (slug ? a.slug === slug : true));
};
