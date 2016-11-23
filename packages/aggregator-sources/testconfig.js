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
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  mw : {
    limit: 20
  }
};
