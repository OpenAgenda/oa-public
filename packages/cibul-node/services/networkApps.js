import NetworkApps from '@openagenda/network-apps';
import eventFormSchema from '@openagenda/event-form/schema';
import logs from '@openagenda/logs';
import { requireUser } from '../lib/authGuards.js';
import { load as loadLayout } from './lib/layouts/index.js';

const log = logs('services/networkApps');

const layout = loadLayout('main', {
  title: 'Admin des réseaux',
});

const { router } = NetworkApps;

export default (parentApp) => {
  parentApp.use('/dist/networkApps', router.dist, (req, res) => res.send(404));

  parentApp.use(
    '/admin/networks',
    requireUser,
    parentApp.services.users.mw.allowSuperAdmin(),
    router,
  );
};

async function createAgenda(services, networkUid, data, user) {
  const { core } = services;

  return core.networks(networkUid).agendas.create(data, {
    userUid: user.uid,
  });
}

async function addAgendaToNetwork(services, uid, dirtySlug, options = {}) {
  const { agendas, core } = services;
  const { credentials, official } = options;

  const slug = dirtySlug.split('?').shift().split('/').pop();

  log('extracted slug %s', slug);

  const agenda = await agendas.get({ slug }, { private: null });

  if (!agenda) {
    throw new Error('Not found');
  }

  // The agenda update fires the core `onUpdate` hook, which already initializes
  // the aggregation limit (-1/null) when `credentials.aggregator` flips — so no
  // extra `aggregators.set` is needed here. A second write would run after
  // `onUpdate` and clobber the correct limit with a coerced boolean.
  await core.networks(uid).agendas.add(agenda.uid, { credentials, official });

  return agenda;
}

export function init(config, services) {
  router.setLayout(layout);

  router.setService(
    NetworkApps({
      CDNPath: `${config.s3.assetsBucketPath}svc`,
      frontAppPath:
        process.env.NODE_ENV !== 'production' ? '/dist/networkApps' : null,
      logger: config.getLogConfig('svc', 'networkApps'),
      interfaces: {
        getEventSchema: () => eventFormSchema({ languages: true }),
        listNetworks: () => services.core.networks.list(),
        getNetwork: (uid) => services.core.networks(uid).get(),
        getNetworkSchema: (uid) => services.core.networks(uid).schema.get(),
        setNetworkSchemaFields: (uid, fields) =>
          services.core.networks(uid).schema.updateFields(fields),
        getNetworkAgendas: (uid) => services.core.networks(uid).agendas(),
        getAgendaCredentialsSchema: () => services.agendas.utils.credentials,
        getLoggedUser: async (req) => req.user,
        addAgendaToNetwork: addAgendaToNetwork.bind(null, services),
        removeAgendaFromNetwork: (uid, agendaUid) =>
          services.core.networks(uid).agendas.remove(agendaUid),
        createAgenda: createAgenda.bind(null, services),
        createNetwork: (data) => services.networks.create(data),
      },
    }),
  );
}
