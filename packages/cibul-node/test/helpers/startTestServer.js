/* eslint-env jest */

// Démarre un app Express de test sur un port éphémère (port 0 → l'OS attribue un
// port libre) et renvoie le serveur plus son URL de base. Évite les ports fixes,
// source de collisions (p. ex. NoMachine écoute sur 4000) entre suites ou avec
// des services tiers de la machine de dev.
//
// Préférer `withTestServer` (ci-dessous) qui gère le cycle de vie ; n'utiliser
// `startTestServer` directement que pour un contrôle manuel.
export default async function startTestServer(app) {
  const server = app.listen(0);
  // Rejeter (et ne pas pendre jusqu'au timeout Jest) si `listen` échoue
  // (EACCES, EMFILE…) ; un 'error' sans listener serait sinon relancé en
  // exception non gérée.
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  return { server, baseUrl: `http://localhost:${server.address().port}` };
}

// Variante haut-niveau : enregistre elle-même le `beforeAll` (démarrage) et le
// `afterAll` (fermeture) et renvoie un contexte dont `.baseUrl` / `.server` sont
// peuplés une fois le `beforeAll` exécuté. `makeApp` est paresseux (appelé dans
// le beforeAll) pour pouvoir lire un `core` construit par un beforeAll antérieur
// du même describe — placer l'appel APRÈS le beforeAll qui initialise `core`.
//
// Usage :
//   const ctx = withTestServer(() => api(core, { useRouter: false }));
//   ...
//   await ky.get(`${ctx.baseUrl}/agendas/123`);
export function withTestServer(makeApp) {
  const ctx = {};

  beforeAll(async () => {
    const { server, baseUrl } = await startTestServer(await makeApp());
    ctx.server = server;
    ctx.baseUrl = baseUrl;
  });

  afterAll(async () => {
    if (ctx.server) {
      await new Promise((resolve) => ctx.server.close(resolve));
    }
  });

  return ctx;
}
