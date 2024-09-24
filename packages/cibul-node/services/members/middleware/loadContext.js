import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/middleware/loadContext');

export default (req, res, next) => {
  req.context = _.merge(
    {
      lang: req.lang,
      sender: {
        userUid: req.user.uid,
        memberName: _.get(req, 'member.custom.contactName') || req.user.name,
      },
    },
    req.body.context,
  );
  log('loaded context', req.context);
  next();
};
