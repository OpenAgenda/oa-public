# Configuration d'un cluster Redis sur Jelastic/Virtuozzo

Un déploiement 'Redis cluster' est disponible sur le Marketplace. Il permet d'activer l'auto-scaling horizontal.

Il est prêt à l'utilisation une fois déployé. Il suffit d'en limiter l'accès en éditent les règles entrantes du pare-feu, accessible depuis les paramètres de l'environnement une fois celui-ci créé.

Pour la connexion depuis une application nodeJS nécessite de référencer plusieurs des nodes du cluster:

```
import { createCluster } from 'redis';

(async () => {
  const cluster = createCluster({
    rootNodes: [{
      url: 'redis://node117132-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }, {
      url: 'redis://node117128-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }, {
      url: 'redis://node117129-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }],
    defaults: {
      password: 'FVPHz6x2i6'
    }
  });

  await cluster.connect();

  // await cluster.set('key', 'value');

  const value = await cluster.get('key');

  console.log(value);

  process.exit();
})();
```
