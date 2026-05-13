import logs from '@openagenda/logs';

const log = logs('superadmin/userChangePassword');

// Superadmin password reset (no `currentPassword` challenge — admin path).
// Resolves the user PK from the OA `uid` query param and delegates to the
// BA-native `auth.adminSetPassword`, which argon2id-hashes the plaintext
// and upserts the credential row. The legacy `users.changePassword`
// Feathers method is gone.
export default async function userChangePassword({ app, query }, res) {
  const { users: usersSvc, auth } = app.services;
  const { uid, password } = query;

  try {
    if (!uid || typeof password !== 'string' || password.length === 0) {
      res.json({ success: false });
      return;
    }
    const user = await usersSvc.findOne({
      query: { uid: Number(uid) },
      internal: true,
    });
    if (!user) {
      res.json({ success: false });
      return;
    }
    await auth.adminSetPassword(user.id, password);
    res.json({ success: true });
  } catch (err) {
    log('error', 'superadmin password reset failed', { uid, err });
    res.json({ success: false });
  }
}
