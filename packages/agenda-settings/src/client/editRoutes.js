import { loadable } from '@openagenda/react-shared';

const EditionApp = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-EditionApp" */ './containers/EditionApp/EditionApp.js'
    ),
);
const GettingStarted = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-GettingStarted" */ './components/GettingStarted.js'
    ),
);
const ProfileEdition = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-ProfileEdition" */ './containers/ProfileEdition/ProfileEdition.js'
    ),
);
const ContributionEdition = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-ContributionEdition" */ './containers/ContributionEdition/ContributionEdition.js'
    ),
);
const AdvancedEdition = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-AdvancedEdition" */ './containers/AdvancedEdition/AdvancedEdition.js'
    ),
);

export default function editRoutes(prefix = '') {
  return [
    {
      path: prefix,
      component: EditionApp,
      routes: [
        {
          path: `${prefix}/getting-started`,
          exact: true,
          component: GettingStarted,
        },
        { path: `${prefix}/settings`, exact: true, component: ProfileEdition },
        { path: `${prefix}/settings/profile`, component: ProfileEdition },
        {
          path: `${prefix}/settings/contribution`,
          component: ContributionEdition,
        },
        { path: `${prefix}/settings/advanced`, component: AdvancedEdition },
      ],
    },
  ];
}
