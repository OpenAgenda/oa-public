module.exports = {
  mysql: {
    database: 'aggregatorSources_test',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    agenda: 'review',
    aggregator: 'aggregator',
    aggregatorSource: 'aggregator_source'
  },
  files: {
    tmpPath: '/var/tmp',
    bucket: 'openagendatst',
    accessKeyId: 'AKIAJCTNQBIZSAPX7HUQ',
    secretAccessKey: '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'
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  mw : {
    limit: 20
  }
};
