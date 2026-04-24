const agendas = [
  { id: 218, uid: 999, slug: null, title: 'Fête de la Science' },
  { id: 219, uid: 998, slug: null, title: 'Fête de la Science - La Réunion' },
  { id: 2, uid: 222, slug: null, title: 'Fête de la Science - Bretagne' },
  {
    id: 3,
    uid: 333,
    slug: 'fds-martinique',
    title: 'Fête de la Science - Martinique',
  },
  { id: 4, uid: 444, slug: null, title: 'Fête de la Science - Guadeloupe' },
];

export default async (uids = [], options = {}) => {
  const { search = null, slug = null } = options;

  return agendas
    .filter((a) => uids.includes(a.uid))
    .filter((a) => (search ? a.title.includes(search) : true))
    .filter((a) => (slug ? a.slug === slug : true));
};
