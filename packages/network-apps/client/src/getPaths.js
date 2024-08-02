export default (prefix) => ({
  main: `${prefix.replace(/\/$/, '')}/`,
  networkEdit: `${prefix.replace(/\/$/, '')}/:uid`,
  networkAgendas: `${prefix.replace(/\/$/, '')}/:uid/agendas`,
});
