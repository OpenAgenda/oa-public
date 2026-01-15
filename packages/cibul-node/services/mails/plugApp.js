import _ from 'lodash';
import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import labels from '@openagenda/labels/unsubscription/index.js';
import makeLabelGetter from '@openagenda/labels';
import incomingEmailsMw from './lib/incomingEmailsMw.js';
import { convertRuleArrayToObject, cleanTarget } from './lib/utils.js';

const getLabel = makeLabelGetter(labels);

const matchesRule = (test) =>
  _.matches(_.pick(test, 'actions', 'subject', 'conditions'));

const log = logs('services/mails/plugApp');

export default function plugApp(app) {
  const { services } = app;

  app.post('/incoming-emails', incomingEmailsMw({ services }));

  app.get(
    '/unsubscribe/:token',
    async function unsubscribeEmail(req, res, next) {
      const { token } = req.params;
      const { unsubscriptions, abilities: abilitiesSvc, sessions } = services;

      try {
        const { target: dirtyTarget, rule } = await unsubscriptions.tokens
          .parse(token)
          .catch((e) => {
            const error = new BadRequest(e, 'Malformed JWT token');
            log.warn(error);
            throw error;
          });

        const target = cleanTarget(dirtyTarget);

        log('evaluating unsubscription request', { target, rule });

        if (target.type === 'email') {
          await unsubscriptions.registry.add(target.value);
          sessions.setFlash(
            req,
            res,
            getLabel('guestUnsubscriptionSucceed', req.lang),
          );
        } else {
          const parsedRule = abilitiesSvc.rules.parse(
            convertRuleArrayToObject(rule),
          );

          log('  parsed rule %j', parsedRule);

          const ability = await abilitiesSvc.get(target.type, target.value);
          const formIndex = await ability.getFormIndex();

          const rulesToChange = formIndex.filter(matchesRule(parsedRule));
          const ruleToUpdate = rulesToChange.map((r) => ({
            ..._.omit(r, 'entity', 'relevantRule'),
            inverted: true,
          }));

          await ability.updateFormIndex(ruleToUpdate);

          sessions.setFlash(
            req,
            res,
            getLabel('unsubscriptionSucceed', req.lang),
          );
        }

        res.redirect(302, req.user ? '/home' : '/');
      } catch (e) {
        next(e);
      }
    },
  );
}
