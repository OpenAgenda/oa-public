"use strict";

module.exports = {
  root: 'https://domain.com',
  logo: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png',
  aws: {
    key: 'string',
    secret: 'string',
    buckets: {
      main: 'nameofmainbucket',
      temporary: 'nameoftmpbucket',
      static: 'nameofstaticbucket',
      services: 'nameofservicesbucket'
    }
  },
  db: {
    name: 'nameofdb',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "dbpassword"
  },
  domains: {
    main: 'domain.com',
    mailer: 'mailgun.domain.com'
  },
  elasticsearch: {
    v1_3 : {
      host: 'elasticsearchserverip',
      port: 9200
    },
    v5_3 : {
      host: 'es53IP',
      port: 9205
    },
    indices: {
      legacyEvents: 'cibul',
      locations: 'location'
    }
  },
  facebook: {
    appId: 'facebookappid',
    appSecret: 'facebooksecret'
  },
  opencage: {
    key: 'opencagekey'
  },
  googleAnalytics: {
    // for main site
    id: 'ga-id-string',
    // for embedded views
    embedId: 'ga-id-string-2'
  },
  mtCaptcha: {
    verifyUrl: 'https://service.mtcaptcha.com/mtcv1/api/checktoken',
    siteKey: 'MTPublic-key',
    privateKey: 'MTPrivat-key'
  },
  googleApps: {
    id: '{your-google-apps-id}.apps.googleusercontent.com',
    secret: '{your-google-apps-secret}'
  },
  iframely: {
    key: '{iframelykey}'
  },
  insightOps: {
    main: null,
    requests: null,
    errors: null,
    events: null,
    eventSearch: null,
    agendas: null,
    aggregators: null,
    unsubscribed: null,
    custom: null,
    mails: null,
    agendaEvents:null
  },
  mailgun: {
    key: 'mailgunkey'
  },
  mails: {
    transport: {
      pool: true,
      host: 'smtp.mailgun.org',
      port: 465,
      secure: true,
      auth: {
        user: 'postmaster@yourmaildomain.com',
        pass: 'yourmgpwd'
      },
      maxMessages: Infinity,
      maxConnections: 1,
      rateLimit: 14,
      rateDelta: 1000
    }
  },
  redis: {
    host: 'redishostaddress',
    port: 6379
  },
  session: {
    keys: [ 'hellomada', 'hellofada', 'iamnowat', 'campgranada' ],
    secret: 'yeepeekayaymadafaka'
  },
  sendinblue: {
    key: 'sendinbluekey',
    list: 1 // id of list
  },
  mailjet: {
    apiKey: null
  },
  sentry: {
    dsn: 'sentrydnsurl'
  },
  twitter: {
    name: '@yourtwitteraccount',
    key: 'twitterconnectappkey',
    secret: 'twitterconnectappsecret'
  },
  sales: {
    emails: [
      'sales.guy@domain.com',
    ],
    pipedriveForm: 'https://pipedrivewebforms.com/form/dd36e7d663fe7c77e3ac65b3bada24e0',
  },
  mapbox: {
    token: 'mapboxtoken'
  }
}
