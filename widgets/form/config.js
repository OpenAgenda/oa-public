var cn = require( '../../js/lib/common/common.mod.js' ),

env = window.env ? window.env : 'prod',

config = {
  all: {
    lang: 'en',
    langAttribute: 'data-lang',
    requireCtl: false,
    standalone: true,
    scrollOffset: 100,
    resources: {
      form: '//cibul.net/embed/{uid}/form',
      sandbox: '//cibul.net/embed/{uid}/form/sandbox'
    },
    labels: {
      fr: {
        add: 'ajoutez un événement',
        cancel: 'retour à la liste'
      },
      en: {
        add: 'add an event',
        cancel: 'back to list',
      },
    },
    classes: {
      form: 'cibulFrame'
    },
    selectors: {
      listFrame: '.cbpglst'
    }
  },
  prod: {},
  dev: {
    resources: {
      form:    '//d.cibul.net/frontend_dev.php/embed/{uid}/form',
      sandbox: '//d.cibul.net/frontend_dev.php/embed/{uid}/form/sandbox'
    }
  },
  tpl: {
    resources: {
      form:    '//d.cibul.net/frontend_dev.php/embed/{uid}/form',
      sandbox: '//d.cibul.net/frontend_dev.php/embed/{uid}/form/sandbox'
    }
  }
}

module.exports = cn.extend( config.all, config[ env ] );