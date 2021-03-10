'use strict';

const fs = require('fs');
const { promisify } = require('util');
const _ = require('lodash');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const expressions = require('angular-expressions');
const removeMd = require('remove-markdown');

const log = require('@openagenda/logs')('generateDocument');
const formatEvent = require('./lib/formatEvent');
const reduceByDeep = require('./lib/reduceByDeep');
const sortBy = require('./lib/sortBy');
const defaultReducer = require('./defaultReducer');

const readFile = promisify(fs.readFile, fs);
const writeFile = promisify(fs.writeFile, fs);

const {
  fetchAndStoreEvents,
  loadEventsFromFile,
  loadAgendaDetails,
} = require('./lib/fetch');

module.exports = async ({
  agendaUid,
  localTmpPath,
  templatePath,
  templateContent,
  reducer = defaultReducer,
  language,
  query = {},
} = {}) => {
  log('generating document for agenda %s', agendaUid);

  const outputPath = `${localTmpPath}/${agendaUid}.${new Date().getTime()}.docx`;

  const eventsFilePath = await fetchAndStoreEvents(localTmpPath, agendaUid, {
    ...query,
    passed: 1,
  });

  const events = await loadEventsFromFile(eventsFilePath);

  const { title, description, url } = await loadAgendaDetails(agendaUid);

  const content = templateContent || (await readFile(templatePath, 'binary'));

  const doc = new Docxtemplater();

  doc.loadZip(new PizZip(content));

  let formattedEvents = events.map(e => formatEvent(e, { lang: language, from: query.from, to: query.to }));
  let reduced = reduceByDeep(formattedEvents, reducer);

  // fs.writeFileSync(
  //   localTmpPath + '/' + agendaUid + '.formatted.json',
  //   JSON.stringify( formattedEvents, null, 2 ),
  //   'utf-8'
  // );

  formattedEvents = null;

  doc.setData({
    agenda: {
      title,
      description,
      url,
    },
    ...reduced,
  });

  reduced = null;

  expressions.filters.join = (input, delimiter) => input.join(delimiter);
  expressions.filters.map = (input, propName) => _.map(input, propName);
  expressions.filters.sortBy = (input, keys) => sortBy(input, keys);
  expressions.filters.removeMd = input => removeMd(input);
  expressions.filters.upperFirst = input => _.upperFirst(input);

  const parser = tag => ({
    get(scope, context) {
      if (tag === '.') {
        return scope;
      }

      const indexes = context.scopePathItem;

      if (tag === '$index') {
        return indexes[indexes.length - 1];
      }

      return expressions.compile(
        tag
          .replace(/\$index/g, indexes[indexes.length - 1])
          .replace(/(‘|’|“|”)/g, "'")
      )(scope);
    },
  });

  doc.setOptions({ parser });

  doc.render();

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    // compression: 'DEFLATE'
  });

  await writeFile(outputPath, buf);

  return {
    outputPath,
    agenda: {
      title,
      description,
      url,
    },
  };
};
