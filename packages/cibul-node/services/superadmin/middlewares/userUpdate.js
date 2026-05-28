export default function userUpdate({ app, loadedUser, body }, res, next) {
  const { users: usersSvc } = app.services;

  usersSvc
    .get(loadedUser.uid, { detailed: true, removed: null })
    .then(async ({ uid }) => {
      const patchedData = {};

      // `store.enable_secret` is the admin gate on whether this user is
      // allowed to mint secret (`sk`) API keys via /users/me/api-keys. The
      // toggle no longer generates a key itself (the user creates them from
      // their settings UI) — it only opens/closes the door.
      if (body.enable_secret !== undefined) {
        patchedData.store = { enable_secret: body.enable_secret === 'true' };
      }

      if (body.transverseApiAccess) {
        patchedData.transverseApiAccess = body.transverseApiAccess === 'true';
      }

      const respUser = await usersSvc.patch(uid, patchedData, {
        detailed: true,
        removed: null,
        internal: true,
      });

      res.json({
        success: true,
        user: respUser,
      });
    })
    .catch(next);
}
