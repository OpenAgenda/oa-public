import fs from 'node:fs';

export default (suffix = 'test', decorate = null) => {
  const agendas = JSON.parse(
    fs.readFileSync(
      `${import.meta.dirname}/../fixtures/agendas.${suffix}.json`,
      'utf-8',
    ),
  );

  const fn = decorate || ((a) => a);

  return async (agenda) =>
    fn(agendas.filter((a) => agenda.uid === a.uid).pop());
};
