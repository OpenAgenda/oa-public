'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('processGenerateRequest');
const cleanString = require('./lib/cleanString');
const agendaFiles = require('./lib/agendaFiles');
const defaultState = require('./defaultState');
const generateDocument = require('./generateDocument');

module.exports = async function processGenerateRequest(
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
      templatePath: `${__dirname}/../input.docx`,
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
};
