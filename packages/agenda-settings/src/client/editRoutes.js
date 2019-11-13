import loadable from '@openagenda/react-utils/dist/loadable';

const EditionApp = loadable(() =>
  import( /* webpackChunkName: "agendaSettings-EditionApp" */ './containers/EditionApp/EditionApp' )
);
const ProfileEdition = loadable(() =>
  import( /* webpackChunkName: "agendaSettings-ProfileEdition" */ './containers/ProfileEdition/ProfileEdition' )
);
const ContributionEdition = loadable(() =>
  import( /* webpackChunkName: "agendaSettings-ContributionEdition" */ './containers/ContributionEdition/ContributionEdition' )
);
const AdvancedEdition = loadable(() =>
  import( /* webpackChunkName: "agendaSettings-AdvancedEdition" */ './containers/AdvancedEdition/AdvancedEdition' )
);

export default function editRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: EditionApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: ProfileEdition },
        { path: `${prefix}/profile`, component: ProfileEdition },
        { path: `${prefix}/contribution`, component: ContributionEdition },
        { path: `${prefix}/advanced`, component: AdvancedEdition }
      ]
    }
  ];

}
