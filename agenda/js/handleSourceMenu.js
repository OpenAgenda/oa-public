var cn = require( '../../js/lib/common/common.mod' ),

remote = require( '../../js/lib/remote/remote.mod' ),

deepExtend = require( 'deep-extend' ),

lightbox = require( '../../js/lib/lightbox/lightbox.mod' ),

debug = require( 'debug' ),

defaults = {
  all: {
    resources: {
      list: '//pre.openagenda.com/agenda/{{uid}}/aggregator/sourcecontext',
      add: '//pre.openagenda.com/agenda/{{uid}}/aggregator/addTo/{{aUid}}',
      remove: '//pre.openagenda.com/agenda/{{uid}}/aggregator/removeFrom/{{aUid}}'
    },
    classes: {
      menu: 'agg-menu',
      item: 'hurl',
      lightbox: {
        frame: 'wsq lightbox-frame',
        canvas: 'lightbox-canvas', 
        buttonBox: 'lightbox-buttons', 
        body: 'noscroll'
      }
    },
    templates: {
      unpicked: '<a><span class="agg-add"><i class="fa fa-plus"></i></span><span>{{title}}</span></a>',
      picked: '<a><span class="agg-remove"><i class="fa fa-check"></i><i class="fa fa-close">&times;</i></span><span>{{title}}</span></a>',
      aggLink: '<a class="url"><i class="icon-share-alt"></i><span>{{ label }}</span></a>',
      menu: '<label>{{label}}</label><ul></ul>'
    },
    label: {
      link: {
        en: 'use as source',
        fr: 'utiliser comme source'
      },
      menuTitle: {
        en: 'select an agenda to which add this agenda as a source',
        fr: 'choisissez un agenda auquel ajouter l\'agenda courant comme source' 
      }
    }
  },
  prod: {},
  dev: {
    resources: {
      list: '//d.openagenda.com/frontend_dev.php/agenda/{{uid}}/aggregator/sourcecontext',
      add: '//d.openagenda.com/frontend_dev.php/agenda/{{uid}}/aggregator/addTo/{{aUid}}',
      remove: '//d.openagenda.com/frontend_dev.php/agenda/{{uid}}/aggregator/removeFrom/{{aUid}}'
    }
  },
  test: {
    resources: {
      list: '//d.openagenda.com/frontend_test.php/agenda/{{uid}}/aggregator/sourcecontext',
      add: '//d.openagenda.com/frontend_test.php/agenda/{{uid}}/aggregator/addTo/{{aUid}}',
      remove: '//d.openagenda.com/frontend_test.php/agenda/{{uid}}/aggregator/removeFrom/{{aUid}}'
    }
  },
  tpl: {
    resources: {
      list: '/server/testdata/sourcecontext.json',
      add: '/server/testdata/sourceaddresult.json',
      remove: '/server/testdata/sourceremoveresult.json'
    }
  }
},

params = deepExtend( defaults.all, typeof window.env == 'undefined' ? {} : defaults[ window.env ]),

lang,

log,

uid;

module.exports = function( agendaUid, anchor, session ) {

  log = debug( 'sources' );

  if ( !anchor ) {

    log( 'anchor element of source menu was not found' );

    return;

  }

  lang = session.culture;

  uid = agendaUid;

  log( 'adding sources link' );

  _addLink( anchor, { onClick: function( e ) {

    remote.get( _format( params.resources.list, { uid: uid } ), { retries: 0, timeout: 10000 }, function( responseType, data ) {

      lightbox({
        elems: [ _buildMenu( data.data ) ],
        classes: params.classes.lightbox,
        buttons: false
      });

    }, true );

  } } );

};

function _addLink( anchor, options ) {

  var div = document.createElement( 'div' ),

  link;

  div.innerHTML = _format( params.templates.aggLink, { label: params.label.link[ lang ] } );

  link = cn.childObject( div, 0 );

  cn.addEvent( link, 'click', options.onClick );

  anchor.insertAdjacentElement( 'beforeend', link );

}


function _buildMenu( data ) {

  var menu = document.createElement( 'div' );

  menu.innerHTML = _format( params.templates.menu, { label: params.label.menuTitle[ lang ] } );

  menu.className = params.classes.menu;

  cn.forEach( data, function( item ) {

    var li = document.createElement( 'li' );

    li.className = params.classes.item;

    li.innerHTML = _format( params.templates[ item.l ? 'picked' : 'unpicked' ], item.p );

    cn.addEvent( li, 'click', function( e ) {

      cn.preventDefault( e );

      remote.get( _format( params.resources[ item.l ? 'remove' : 'add' ], { uid: uid, aUid: item.p.uid } ), {}, function( responseType, data ) {

        lightbox({
          message: data.message,
          classes: params.classes.lightbox
        });

      }, true );

    });

    cn.el( menu, 'ul' ).appendChild( li );

  } );

  return menu;

}

function _format( tpl, ctx ) {
  
  return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function(m, g) {
      return ctx[g.replace(/^\s+|\s+$/g, '')] || '';
  });

}