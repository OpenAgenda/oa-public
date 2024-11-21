import _ from 'lodash';
import logs from '@openagenda/logs';
import cleanString from './lib/cleanString.js';
import agendaFiles from './lib/agendaFiles.js';
import defaultState from './defaultState.js';
import generateDocument from './generateDocument.js';

const log = logs('processGenerateRequest');

export default async function processGenerateRequest(
  { s3, localTmpPath },
  data,
) {
  const files = agendaFiles({
    s3,
    bucket: s3.bucket,
    uid: data.uid,
  });

  const state = await files.getJSON('state.json', defaultState);
  const template = (state.templates || []).find(
    (v) => v.name === data.templateName,
  );
  const templatePath = template ? template.path : 'template.docx';

  let templateContent;

  try {
    templateContent = await files.get(templatePath);
  } catch (err) {
    if (err.code !== 'NoSuchKey') {
      console.log('error', err);
    }
  }

  try {
    const { outputPath, agenda } = await generateDocument({
      agendaUid: data.uid,
      language: 'fr',
      localTmpPath,
      templatePath: `${import.meta.dirname}/../input.docx`,
      templateContent,
      reducer: template && template.reducer ? template.reducer : state.reducer,
      query: _.pick(data, 'from', 'to'),
    });

    const filename = cleanString(`${agenda.title}.docx`);

    const { path } = await files.set(outputPath, filename);

    state.file = {
      name: filename,
      path,
      createdAt: new Date(),
    };
  } catch (e) {
    log.error(e, e.properties.errors);
  }

  state.queued = false;

  await files.setJSON('state.json', state);
}
