export default (config, agenda) => (agenda.image ? {
  src: agenda.image,
  width: '100px',
} : {
  src: `${config.root}/images/openagenda.png`,
  width: '300px',
});
