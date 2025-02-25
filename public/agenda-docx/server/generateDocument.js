import fs from 'node:fs/promises';
import _ from 'lodash';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import expressions from 'angular-expressions';
import removeMd from 'remove-markdown';
import logs from '@openagenda/logs';
import formatEvent from './lib/formatEvent.js';
import reduceByDeep from './lib/reduceByDeep.js';
import sortBy from './lib/sortBy.js';
import defaultReducer from './defaultReducer.js';
import {
  fetchAndStoreEvents,
  loadEventsFromFile,
  loadAgendaDetails,
} from './lib/fetch.js';

const log = logs('generateDocument');

export default async ({
  root = 'https://openagenda.com',
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

  const { title, description, url } = await loadAgendaDetails(root, agendaUid);

  const content = templateContent || await fs.readFile(templatePath, 'binary');

  const doc = new Docxtemplater();

  doc.loadZip(new PizZip(content));

  let formattedEvents = events.map((e) =>
    formatEvent(e, { lang: language, from: query.from, to: query.to }));
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
  expressions.filters.removeMd = (input) => removeMd(input);
  expressions.filters.upperFirst = (input) => _.upperFirst(input);

  const parser = (tag) => ({
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
          .replace(/(‘|’|“|”)/g, "'"),
      )(scope);
    },
  });

  doc.setOptions({ parser });

  doc.render();

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    // compression: 'DEFLATE'
  });

  await fs.writeFile(outputPath, buf);

  return {
    outputPath,
    agenda: {
      title,
      description,
      url,
    },
  };
};
