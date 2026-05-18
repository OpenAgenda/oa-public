import labels from '@openagenda/labels/users/settings.js';
import makeLabelGetter from '@openagenda/labels';
import { setFlash } from '../../../lib/flash.js';

const getLabel = makeLabelGetter(labels);

export default () => (req, res, next) => {
  if (res.data) {
    setFlash(res, getLabel('accountRemoved', req.lang));
  }

  next();
};
