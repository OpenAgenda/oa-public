// Démarre un app Express de test sur un port éphémère (port 0 → l'OS attribue un
// port libre) et renvoie le serveur plus son URL de base. Évite les ports fixes,
// source de collisions (p. ex. NoMachine écoute sur 4000) entre suites ou avec
// des services tiers de la machine de dev.
//
// Usage :
//   let server, baseUrl;
//   beforeAll(async () => {
//     ({ server, baseUrl } = await startTestServer(api(core, { useRouter: false })));
//   });
//   afterAll(() => server.close());
export default async function startTestServer(app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, baseUrl: `http://localhost:${server.address().port}` };
}
