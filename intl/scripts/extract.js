'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const glob = require('glob');
const { mkdirp } = require('mkdirp');
const { extract } = require('@formatjs/cli');
const { DEFAULT_LANG, DEFAULT_LANGS } = require('../lib/constants');
const getMessages = require('./utils/getMessages');
const createIndex = require('./utils/createIndex');
const inputToOuputPath = require('./utils/inputToOuputPath');
const fileExists = require('./utils/fileExists');

const defaults = {
  files: ['src/**/*.js'],
  output: 'src/locales/%lang%.json',
  defaultLang: DEFAULT_LANG,
  langs: DEFAULT_LANGS,
  definedDefault: ['fr'],
  idInterpolationPattern: '[sha512:contenthash:base64:6]',
  skipIndex: false,
  skipEmpty: false,
};

// Functions

function sortObj(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((accu, key) => {
      accu[key] = obj[key];
      return accu;
    }, {});
}

function getDefaults({
  extractedMessages,
  lang,
  defaultLang,
  definedDefault,
}) {
  if (lang === defaultLang) {
    return extractedMessages;
  }

  if (definedDefault.includes(lang)) {
    return _.mapValues(extractedMessages, () => '');
  }

  return {};
}

async function extractMessages({
  files,
  idInterpolationPattern,
  format,
}) {
  const filesToExtract = files.reduce((accu, globFiles) => {
    accu.push(...glob.sync(globFiles));
    return accu;
  }, []);
  const result = {};

  for (const file of filesToExtract) {
    result[file] = JSON.parse(await extract([file], {
      idInterpolationPattern,
      extractFromFormatMessageCall: true,
      format,
    }));
  }

  return result;
}

async function extractLang({
  files,
  output,
  lang,
  defaultLang,
  definedDefault,
  extractedMessages,
  skipEmpty,
}) {
  const result = {};

  for (const globFiles of files) {
    for (const file of glob.sync(globFiles)) {
      if (skipEmpty && Object.keys(extractedMessages[file]).length === 0) {
        continue;
      }

      const { result: outPath } = inputToOuputPath(globFiles, file, output, lang);

      const localesPath = path.join(process.cwd(), outPath.replace(/\.js$/, '.json'));
      const existingMessages = getMessages(localesPath);

      const defaultMessages = getDefaults({
        extractedMessages: extractedMessages[file],
        lang,
        defaultLang,
        definedDefault,
      });

      const messages = _.pickBy(
        existingMessages,
        (value, key) => key in extractedMessages[file] && value,
      );

      const messagesWithDefaults = _.merge(defaultMessages, messages);

      result[localesPath] = {
        ...result[localesPath],
        ...messagesWithDefaults,
      };
    }
  }

  const createdFiles = [];

  for (const localesPath in result) {
    if (!Object.prototype.hasOwnProperty.call(result, localesPath)) continue;

    await mkdirp(path.dirname(localesPath));
    fs.writeFileSync(localesPath, `${JSON.stringify(sortObj(result[localesPath]), null, 2)}\n`);

    createdFiles.push(localesPath);
  }

  // Is not multi output
  if (!output.includes('**')) {
    return createdFiles;
  }

  // Remove obsolete files
  const localesBasePath = output.replace('%lang%', lang).replace('%original_file_name%', '*.json');
  const localesFiles = glob.sync(localesBasePath);

  for (const localesFile of localesFiles) {
    const hasInput = files.some(globFiles => {
      const {
        result: messageFilePath,
        originalFileName,
      } = inputToOuputPath(localesBasePath, localesFile, globFiles, lang);
      const inputPath = path.join(
        process.cwd(),
        path.dirname(messageFilePath),
        originalFileName.replace(/\.json$/, '.js'),
      );

      return fileExists(inputPath);
    });

    if (!hasInput) {
      fs.unlinkSync(path.join(process.cwd(), localesFile));
    }
  }

  return createdFiles;
}

// Command

module.exports.command = 'extract [files...]';

module.exports.describe = 'Extract messages.';

module.exports.builder = yargs => {
  yargs.positional('files', {
    default: defaults.files,
    desc: 'Glob paths to extract translations from, the source files.',
    array: true,
  });

  yargs.options({
    output: {
      alias: 'o',
      default: defaults.output,
      desc: 'The target path where the script will output an aggregated'
        + ' `.json` file per lang of all the translations from the `files` supplied.',
    },
    defaultLang: {
      default: defaults.defaultLang,
      desc: 'Default language, the one that is filled in for the default messages in the files.',
    },
    langs: {
      default: defaults.langs.join(','),
      coerce: arg => arg.split(','),
      desc: 'The target languages of the translations.',
    },
    definedDefault: {
      default: defaults.definedDefault.join(','),
      coerce: arg => arg.split(','),
      desc: 'Languages that are populated with messages set to "" for ease of translation.',
    },
    idInterpolationPattern: {
      default: defaults.idInterpolationPattern,
      desc: 'If certain message descriptors don\'t have id,'
        + ' this `pattern` will be used to automatically generate IDs for them,\n'
        + 'where `contenthash` is the hash of `defaultMessage` and `description`.',
    },
    skipIndex: {
      default: defaults.skipIndex,
      type: 'boolean',
      desc: 'Does not create index js file.',
    },
    skipEmpty: {
      default: defaults.skipEmpty,
      type: 'boolean',
      desc: 'Does not create empty locale files.',
    },
  });
};

module.exports.handler = async argv => {
  const {
    files = defaults.files,
    output = defaults.output,
    idInterpolationPattern = defaults.idInterpolationPattern,
    defaultLang = defaults.defaultLang,
    langs = defaults.langs,
    definedDefault = defaults.definedDefault,
    skipIndex = defaults.skipIndex,
    skipEmpty = defaults.skipEmpty,
  } = argv;

  const format = 'simple';

  const extractedMessages = await extractMessages({
    files,
    idInterpolationPattern,
    format,
  });

  const extractResults = await Promise.allSettled(
    langs.map(lang => extractLang({
      files,
      output,
      lang,
      defaultLang,
      definedDefault,
      extractedMessages,
      skipEmpty,
    })),
  );

  extractResults.forEach(result => {
    if (result.status === 'rejected') {
      console.log('Extract error:', result.reason);
    }
  });

  if (!skipIndex && path.basename(output) === '%lang%.json' && !output.includes('**')) {
    await createIndex(output, langs);
  }
};
