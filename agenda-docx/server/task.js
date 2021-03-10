'use strict';

const _ = require('lodash');
const config = require('./config');
const cleanString = require('./lib/cleanString');
const agendaFiles = require('./lib/agendaFiles');
const defaultState = require('./defaultState');
const generateDocument = require('./generateDocument');
const queue = require('./queue');

async function loop(data) {
  const files = agendaFiles({
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: data.uid,
  });

  const state = await files.getJSON('state.json', defaultState);
  const template = (state.templates || []).find(
    v => v.name === data.templateName
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
      localTmpPath: config.localTmpPath,
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
    console.log('error', e);
  }

  state.queued = false;

  await files.setJSON('state.json', state);
}

module.exports = async () => {
  // loop( await queue.waitAndPop() );

  let data = await queue.waitAndPop().catch(_.noop);

  while (data) {
    await loop(data).catch(_.noop);

    data = await queue.waitAndPop().catch(_.noop);
  }
};
