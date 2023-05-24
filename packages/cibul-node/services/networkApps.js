'use strict';

const NetworkApps = require('@openagenda/network-apps');
const eventFormSchema = require('@openagenda/event-form/src/schema');

const log = require('@openagenda/logs')('services/networkApps');

const cmn = require('../lib/commons-app');

const layout = require('./lib/layouts').load('main', {
  title: 'Admin des réseaux',
});

const { router } = NetworkApps;

module.exports = parentApp => {
  parentApp.use(
    '/dist/networkApps',
    router.dist,
    (req, res) => res.send(404),
  );

  parentApp.use(
    '/admin/networks',
    parentApp.services.sessions.mw.ifUnlogged((req, res) => res.redirect(302, '/')),
    cmn.requireSuperAdmin,
    router,
  );
};

async function createAgenda(services, networkUid, data, user) {
  const {
    core,
  } = services;

  return core.networks(networkUid).agendas.create({
    ...data,
    ownerId: user.id,
  });
}

async function addAgendaToNetwork(services, uid, dirtySlug) {
  const {
    agendas,
    core,
  } = services;

  const slug = dirtySlug.split('?').shift()
    .split('/').pop();

  log('extracted slug %s', slug);

  const agenda = await agendas.get({ slug }, { private: null });

  if (!agenda) {
    throw new Error('Not found');
  }

  await core.networks(uid).agendas.add(agenda.uid);

  return agenda;
}

module.exports.init = (config, services) => {
  router.setLayout(layout);

  router.setService(NetworkApps({
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/networkApps' : null,
    logger: config.getLogConfig('svc', 'networkApps'),
    interfaces: {
      getEventSchema: () => eventFormSchema({ languages: true }),
      listNetworks: () => services.core.networks.list(),
      getNetwork: uid => services.core.networks(uid).get(),
      getNetworkSchema: uid => services.core.networks(uid).schema.get(),
      setNetworkSchemaFields: (uid, fields) => services.core.networks(uid).schema.updateFields(fields),
      getNetworkAgendas: uid => services.core.networks(uid).agendas(),
      getLoggedUser: async req => req.user,
      addAgendaToNetwork: addAgendaToNetwork.bind(null, services),
      removeAgendaFromNetwork: (uid, agendaUid) => services.core.networks(uid).agendas.remove(agendaUid),
      createAgenda: createAgenda.bind(null, services),
      createNetwork: data => services.networks.create(data),
    },
  }));
};
