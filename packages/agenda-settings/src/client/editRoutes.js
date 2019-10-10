import { lifecycle, hoistStatics } from 'recompose';
import du from '@openagenda/dom-utils';
import { EditionApp, ProfileEdition, ContributionEdition, AdvancedEdition } from './containers';

const tabs = [
  'settings_profile',
  'settings_contribution',
  'settings_advanced'
];

function onMenuClick( history ) {
  return function ( e ) {
    e.preventDefault();
    history.push( this.getAttribute( 'href' ) );
  };
};

const withMenu = item => hoistStatics( lifecycle( {
  componentDidMount() {
    const elems = du.els( '.js_menu_item' );
    const elem = du.el( `.js_menu_item_${item}` );

    elems.forEach( e => {
      du.removeClass( e, 'selected' );
      du.removeClass( du.el( e, 'a' ), 'active' );
    } );

    if ( elem ) {
      du.addClass( elem, 'selected' );
      du.addClass( du.el( elem, 'a' ), 'active' );
    }

    this.listeners = {};

    tabs.forEach( tab => {
      const fn = onMenuClick( this.props.history );

      this.listeners[ tab ] = fn;
      du.addEvent( document.querySelector( `.js_menu_item_${tab} a` ), 'click', fn );
    } );
  },
  componentWillUnmount() {
    tabs.forEach( tab => du.removeEvent(
      document.querySelector( `.js_menu_item_${tab} a` ),
      'click',
      this.listeners[ tab ]
    ) );
  }
} ) );

export default function editRoutes( prefix = '' ) {
  return [
    {
      path: prefix,
      component: EditionApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: withMenu( 'settings_profile' )( ProfileEdition ) },
        { path: `${prefix}/profile`, component: withMenu( 'settings_profile' )( ProfileEdition ) },
        { path: `${prefix}/contribution`, component: withMenu( 'settings_contribution' )( ContributionEdition ) },
        { path: `${prefix}/advanced`, component: withMenu( 'settings_advanced' )( AdvancedEdition ) }
      ]
    }
  ];

}
