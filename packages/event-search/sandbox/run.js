'use strict';

const elasticsearch = require('@elastic/elasticsearch');
const debug = require('debug');
const fs = require('fs');
const prompts = require('prompts');

const {
  elasticsearch: config,
  ssl
} = require('../testconfig');

const inFolderPath = __dirname + '/in/';
const outFolderPath = __dirname + '/out/';

debug.enable('⦙');
const log = debug('⦙');

(async () => {
  log(fs.readFileSync(__dirname + '/README.md', 'utf-8'));

  const client = new elasticsearch.Client({
    node: config.node,
    ssl: config.ssl
  });

  while(true) {
    const choices = fs.readdirSync(inFolderPath)
      .map(f => JSON.parse(
        fs.readFileSync(inFolderPath + f)
      ));

    const { DSL } = await prompts({
      type: 'select',
      name: 'DSL',
      message: 'Choix de la requête à executer',
      choices: choices.concat({
        title: 'Quitter',
        value: null
      })
    });

    if (!DSL) {
      break;
    }

    const { index } = await prompts({
      type: 'select',
      name: 'index',
      message: 'Choix de l\'index',
      default: 'dev',
      choices: [{
        title: 'Dev',
        value: 'dev'
      }, {
        title: 'Test',
        value: 'test'
      }]
    });

    let result;

    try {
      result = {
        success: true,
        returned: await client.search({
          index,
          body: DSL
        })
      };
    } catch (e) {
      result = {
        success: false,
        returned: e
      };
    }

    log(JSON.stringify(result, null, 2));

    fs.writeFileSync(__dirname + '/result.json', JSON.stringify(result, null, 2));
  }

  await client.close();

  process.exit();

})();
