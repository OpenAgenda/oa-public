# Recettes

## Jelastic

Forcer une redirection vers https: https://stackoverflow.com/questions/37370280/jelastic-nginx-http-to-https-redirect

## redis

Pour copier une base redis sur un nouveau serveur, on se connecte au nouveau serveur et on lance la commande:

    redis-cli slaveof IP-ADDRESS-OF-OLD-SERVER 6379

Une fois que la réplication est faite (la ram doit être occupée d'une manière similaire) et qu'on est prêt à basculer, on arrête la réplication:

    redis-cli slaveof no one

Et voilà. [Source](https://www.tothenew.com/blog/copying-redis-database-from-one-server-to-another/)

redis,configuration

## regex

Utilitaires pour gérer des regex avec des routes express:

 * [PillarJs](https://github.com/pillarjs/path-to-regexp): convertit une route express en regex
 * [Express Route Tester](https://forbeslindesay.github.io/express-route-tester/): app de test de route express

express,regex

## yarn

### Publier une lib publique de manière isolée

Utile quand on veux publier une librairie publique sans pour autant partir d'un monorepo propre (à jour, sans modifications). Cette méthode est une "mauvaise" pratique, elle est à éviter au possible. Il faut préférer la méthode documentée dans `CONTRIBUTING.md`

On fait les commits sur la lib, on itère sur la version directement dans le `package.json` qu'on commit également, puis `yarn npm publish --access public`

## structure d'un projet

[Comment nommer les dossiers](https://gist.github.com/tracker1/59f2c13044315f88bee9)