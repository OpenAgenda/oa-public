export default function userUpdate({ app, loadedUser, body }, res, next) {
  const { users: usersSvc } = app.services;

  usersSvc
    .get(loadedUser.uid, { detailed: true, removed: null })
    .then(async ({ uid }) => {
      if (body.enable_secret === 'true') {
        await usersSvc.generateApiKey(
          uid,
          {
            secretKey: true,
          },
          { removed: null },
        );
      }

      const patchedData = {};

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
