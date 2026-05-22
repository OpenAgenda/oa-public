import _ from 'lodash';
import { authClient } from '@openagenda/auth/client';

const defaults = {
  selector: '.js_inbox_header',
  res: {
    haveUnread: '/inbox/have-unread'
  },
  classes: {
    hide: 'hide'
  }
};

export default async function headerInbox(options) {
  const params = _.merge(defaults, options);

  const user = (await authClient.getSession()).data?.user ?? null;

  if (!user) return;

  const anchorElem = document.querySelector(params.selector);

  if (!anchorElem) return;

  // get haveUnread flag
  // add new icon on link if needed

  if (anchorElem.classList.contains(params.classes.hide)) {
    anchorElem.classList.remove(params.classes.hide);
  }
}
