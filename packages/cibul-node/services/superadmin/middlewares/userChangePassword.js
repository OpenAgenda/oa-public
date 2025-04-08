export default function userChangePassword({ app, query }, res) {
  const { users: usersSvc } = app.services;
  const { uid, password } = query;

  usersSvc
    .changePassword(uid, { password })
    .then(() => {
      res.json({ success: true });
    })
    .catch(() => {
      res.json({ success: false });
    });
}
