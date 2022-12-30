'use strict';

module.exports = async (core, userAgendasResult) => {
  const {
    agendas,
  } = await core.agendas.search({
    uid: userAgendasResult.items.map(i => i.uid),
  }, {
    size: userAgendasResult.items.length,
  }, {
    detailed: true,
    indexed: null,
    private: null,
  });

  userAgendasResult.items.forEach(item => {
    Object.assign(item, agendas.find(a => item.uid === a.uid) || {});
  });
};
