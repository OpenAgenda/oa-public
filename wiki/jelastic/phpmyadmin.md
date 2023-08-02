# Installation de PHPMyAdmin

L'installation de phpmyadmin peut être fait sur le noeud d'où sont faites les mises à jour de l'application.

Ce guide va détailler comment installer phpmyadmin, comment l'interfacer avec un serveur nginx et comment sécuriser la connexion avec des clés.

Commencer par installer nginx, php et mysql-server. PHPMySQL utilise une installation mysql pour sa configuration.

## MySQL local

Un guide pour l'install d'un mysql local: https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04

## Nginx

Pour nginx, on préfère aussi une install locale pour éviter de devoir déployer un noeud d'équilibrage de charge. (on en profite pour virer une éventuelle installation pré-existente d'apache2 avec un `sudo apt-get remove apache2`)

    sudo apt-get install nginx

A ce stade on doit voir la page par défaut nginx apparaitre quand on tape dans l'URL de l'environnement. Si l'Accès via SLB est coché dans sa config. Mais on veut faire pointer un sous-domaine plutôt, pour se souvenir de l'url de l'app plus facilement. De manière sécurisée. Sans utiliser un bloc d'équilibrage jelastic un peu plus couteux.

Le SLB ne permet pas de faire ça, on le désactive et on associe un ip publique à l'environnement. Un peu plus cher mais moins qu'un bloc d'équilibrage. Puis on va dans le DNS ajouter une entrée "A" pour le sous-domaine pointant vers la dite IP. Pour boucler la boucle, on place le sous-domaine choisi dans la petite clé à molette jaune de l'environnement sous l'item "Sous-domaines".

Et là, le sous-domaine doit pointer sur la page par défaut proposée par nginx.

En non sécurisé. Pas bien.

Donc on sécurise avec un letsencrypt mode terminal puisqu'on n'a pas mis le noeud d'équilibrage. Le certbot permet de faire ça assez facilement. Par ici: https://certbot.eff.org/ avecc un website qui run avec Ninx sur ubuntu (à priori)

Note pour l'install de snapd: le guide d'install ne dit pas qu'il faut lancer snapd. Ça marche mieux si on le fait: `sudo systemctl start snapd`. https://stackoverflow.com/questions/66008918/cannot-communicate-with-server-post-http-localhost-v2-snaps-discord-dial-uni

Et là, le sous-domaine pointe sur la page par défaut proposée par nginx. En sécurisé. Vérifier que le http redirige bien vers le https.


Dans la config "default" de nginx, décommenter la partie qui envoie à php les requêtes php et ajouter `index.php` dans la liste des fichiers en face de la clause `index`.

Ça peut être utile de vérifier si php-fpm tourne et éventuellement le lancer.

    service php7.4-fpm status
    service php7.4-fpm start


## PHPMyAdmin

Une fois l'install du nginx et du mysql local faite, le plus simple est de télécharger phpmyadmin depuis le site officiel puis de décompresser son contenu dans le dossier /usr/share/phpmyadmin et de changer le chemin du dossier home sur la config default de nginx et mettre le dossier phpmyadmin à la place `/usr/share/phpmyadmin`

## Sécuriser la connexion par clés clients

On sécurise le machin encore plus pour ne permettre le chargement de la page que quand une clé client est fournie, similairement au fonctionnement du cluster elasticsearch en mode sécurisé.

Pour ça, il faut avoir une autorité de certification sous la main. Un certificat autorité et sa clé privée. Et commencer par placer le certificat quelque part dans le serveur. Sous `/etc/nginx/certs/auth.pem`

On génère les clés clientes avec le script `create_client_certificate.sh` et on précise un mot de passe quand la question "Enter Export Password" est posée.

Dans la conf nginx, on ajoute la clause suivante:

    ssl_verify_client on;
    ssl_client_certificate /etc/nginx/certs/auth.pem;

On redémarre: on ne devrait plus avoir accès à phpmyadmin, sauf à charger la clé p12 dans son navigateur.

wigglypoof1981