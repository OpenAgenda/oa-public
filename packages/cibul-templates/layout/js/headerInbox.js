import _ from 'lodash';
import sessions from '@openagenda/sessions/client';

const defaults = {
  selector: '.js_inbox_header',
  res: {
    haveUnread: '/inbox/have-unread'
  },
  classes: {
    hide: 'hide'
  }
};

export default function headerInbox(options) {
  const params = _.merge(defaults, options);

  const user = sessions.getUser();

  if (!user) return;

  const anchorElem = document.querySelector(params.selector);

  if (!anchorElem) return;

  // get haveUnread flag
  // add new icon on link if needed

  if (anchorElem.classList.contains(params.classes.hide)) {
    anchorElem.classList.remove(params.classes.hide);
  }
}
