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

## Monitoring

Une application web est proposée par le cluster, elle est accessible en non sécurisé. Pas tip top pour la prod. Un proxy doit être configuré sur le serveur d'administration pour sécuriser les connexions (similairement au phpmyadmin pour la base). Les mêmes clés client pourront être utilisées pour la connexion.

Il faut faire pointer le sous-domaine qui servira vers l'environnement d'administration et le lier à l'environnement jelastic.

Puis dans la config nginx du noeud d'admin, rajouter une section serveur pour proxiser les requêtes.

Utiliser `sudo certbot --nginx` pour créer les certificats

Et mettre en place le proxy et l'authentification client. On se retrouve avec une config serveur qui ressemble à ça: 

```
server {
    server_name p3x.oagenda.com;
    location / {
      proxy_pass http://node117132-oa-redis.jcloud-ver-jpe.ik-server.com;
    }

    ssl_verify_client on;
    ssl_client_certificate /etc/nginx/certs/auth.pem;

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/p3x.oagenda.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/p3x.oagenda.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```

Une fois que tout marche, on peut désactiver la demande de mot de passe et bloquer la connexion au cluster redis en http depuis internet. Le noeud hébergeant l'app d'admin est communiqué par email au moment de la création du cluster. Avant de pouvoir faire ça il faut lancer le script qui permet l'accès sudo sur l'environnement, sans quoi l'édition des fichiers nginx sera compliquée.

## Sécurisation

Une fois que l'outil d'administration (p3x) est configuré, l'accès SLB peut être désactivé pour empecher toute connexion provenant d'internet.

Le pare-feu peut limiter les connexions au cluster sur le port 6379 aux environnements web (sous-groupes api et web), tâche ainsi que l'environnement hébergeant l'application p3x. Le port 16379 doit rester accessible au réseau local (la règle prédéfinie peut rester active). Les autres règles du parefeu peuvent être désactivées.
