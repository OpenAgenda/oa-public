import _ from 'lodash';
import sessions from '@openagenda/sessions/client';
import du from '@openagenda/dom-utils';

export default function ( options ) {
  const params = _.merge( {
    selector: '.js_inbox',
    res: {
      haveUnread: '/inbox/have-unread'
    },
    classes: {
      hide: 'hide'
    }
  }, options );

  const user = sessions.getUser();

  if ( !user ) return;

  const anchorElem = document.querySelector( params.selector );

  if ( !anchorElem ) return;

  // get haveUnread flag
  // add new icon on link if needed

  if ( du.hasClass( anchorElem, params.classes.hide ) ) {
    du.removeClass( anchorElem, params.classes.hide );
  }

}
