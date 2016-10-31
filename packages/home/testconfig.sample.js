module.exports = {
  mysql: {
    database: 'home_test',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    agendas: 'review',
    stakeholders: 'reviewer'
  },
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  mw : {
    limit: 20
  }
};