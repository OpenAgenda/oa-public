export default (services, networkUid, options = {}) =>
  services.agendas
    .list(
      {
        networkUid,
      },
      0,
      1000,
      options,
    )
    .then((r) => r.agendas);
