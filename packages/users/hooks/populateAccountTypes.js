import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

const getOriginal = (fn) => (fn.original ? getOriginal(fn.original) : fn);

const OAUTH_PROVIDERS = new Set(['google', 'facebook', 'twitter']);
const CREDENTIAL = 'credential';

export default function populateAccountTypes() {
  return async (context) => {
    if (context.result === null) {
      return context;
    }

    const service = context.self;
    const getAccountTypes = service.config?.interfaces?.getAccountTypes;

    // Preferred path — read the BA `account` table. Source of truth since
    // phase 6: signup/reset via better-auth no longer writes back to the
    // legacy `user.{password, facebook_uid, twitter_id, google_id}` columns,
    // so anything reading those columns will report `false` for BA-only
    // users (`hasLocalAccount`) and BA-OAuth-only users (`hasSocialAccount`).
    if (typeof getAccountTypes === 'function') {
      // Resolve target user PKs once. We can't read them straight off the
      // result rows because non-`detailed` projections strip `id`.
      let items;
      if (Array.isArray(context.result?.data)) {
        items = context.result.data;
      } else if (Array.isArray(context.result)) {
        items = context.result;
      } else {
        items = [context.result];
      }
      const uids = items.map((r) => r?.uid).filter((u) => u != null);
      const idByUid = new Map();
      await Promise.all(
        uids.map(async (uid) => {
          const entity = await getOriginal(service.get).call(service, uid, {
            query: { $select: ['id'] },
          });
          if (entity?.id != null) idByUid.set(uid, entity.id);
        }),
      );
      const ids = Array.from(idByUid.values());
      const typesById = ids.length > 0 ? await getAccountTypes(ids) : new Map();

      return alterItems((record) => {
        const id = idByUid.get(record.uid);
        const providers = id != null ? typesById.get(id) : null;
        return Object.assign(record, {
          hasSocialAccount:
            !!providers
            && Array.from(providers).some((p) => OAUTH_PROVIDERS.has(p)),
          hasLocalAccount: !!providers && providers.has(CREDENTIAL),
        });
      })(context);
    }

    // Legacy fallback — still used in the `@openagenda/users` standalone
    // tests where no BA-backed `interfaces.getAccountTypes` is wired. The
    // production cibul-node config always wires `getAccountTypes`, so this
    // branch never runs there.
    return alterItems(async (record) => {
      const entity = await getOriginal(service.get).call(service, record.uid, {
        query: {
          $select: ['password', 'facebook_uid', 'twitter_id', 'google_id'],
        },
      });

      return Object.assign(record, {
        hasSocialAccount: Boolean(
          entity.facebook_uid || entity.twitter_id || entity.google_id,
        ),
        hasLocalAccount: Boolean(entity.password),
      });
    })(context);
  };
}
