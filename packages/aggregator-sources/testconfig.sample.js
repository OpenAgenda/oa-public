module.exports = {
  mysql: {
    database: 'aggregator_sources_test',
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
    accessKeyId: 'TYFGYTGUG48HUIYG',
    secretAccessKey: 'dqdcscds/dsqds+HNP57f3icQq9GwG'
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  mw : {
    limit: 20
  }
};