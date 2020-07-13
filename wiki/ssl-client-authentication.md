# Authentification client ssl

L'authentification d'un client via une clé ssl est utile dans les cas suivants:

 * Un cluster elasticsearch est accessible sur internet et contient des informations sensibles.
 * Limiter l'accès à une ressource aux membres de l'équipe OA, comme un site de dev, une page d'admin.

Pour y parvenir, nous créons une autorité de certification qui servira à signer les certificats client qui ont accès aux ressources protégées.

Ce guide détaille:

 * La création de l'autorité de certification
 * La création d'un certificat client

La structure de dossiers proposée pour gérer ces certificats est la suivante:

    ssl/
      certs/
        private/
      clients/
        private/

Le répertoire courant pour les sections suivantes sera `ssl`

## Autorité de certification

Nous créons la clé privée du certificat de l'autorité dans `ssl/certs/private`

    openssl genrsa -aes256 -passout pass:xxxx -out certs/private/ca.pass.key 4096 \
    && openssl rsa -passin pass:xxxx -in certs/private/ca.pass.key -out certs/private/ca.key \
    && rm certs/private/ca.pass.key

Puis le certificat directement dans `ssl/certs`

    openssl req -new -x509 -days 3650 \
      -key certs/private/ca.key \
      -out certs/ca.crt

Des informations sont alors demandées. Le nom de l'organisation doit être différent ici que lorsque la même information sera demandée lors de la génération des clés client.

    Country Name (2 letter code) [AU]:FR
    State or Province Name (full name) [Some-State]:
    Locality Name (eg, city) []:Courbevoie
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:OpenAgenda Certification Authority
    Organizational Unit Name (eg, section) []:
    Common Name (e.g. server FQDN or YOUR name) []:openagenda.com
    Email Address []:support@openagenda.com

L'autorité de certification peut alors être utilisée sur toutes les configurations nécessitant un contrôle d'accès via clés. Il suffit de rajouter deux lignes:

    server {
      listen 443;

      ...

      ssl_client_certificate /etc/nginx/morecerts/certs/ca.crt;
      ssl_verify_client on;

      location / {
        ...
      }
    }

Le certificat servant pour l'authentification des clients n'est pas nécessairement lié à celui servant pour la connexion https. Il n'est pas lié non plus au domaine et peut donc être utilisé sur des configurations serveur multiples.

## Création d'une clé client

Nous créons la clé privée dans `clients/private`. Nous nommons la clé en fonction de son utilisateur final:

    openssl genrsa -aes256 -passout pass:xxxx -out clients/private/kaore.pass.key 4096 \
    && openssl rsa -passin pass:xxxx -in clients/private/kaore.pass.key -out clients/private/kaore.key \
    && rm clients/private/kaore.pass.key

La clé créée doit être signée par le certificat. Un fichier `.csr` doit être généré, puis utilisé pour créer le certificat signé correspondant à la clé que nous venons de créer:

    openssl req -new -key clients/private/kaore.key -out kaore.csr

Comme nous sommes à l'origine de l'autorité et que nous utilisons le `csr` dans la foulée de sa création puis le supprimons directement après, il n'est pas utile de saisir un mot de passe. Le nom de l'organisation doit être différent de celui utilisé pour l'autorité de certification:

    Country Name (2 letter code) [AU]:FR
    State or Province Name (full name) [Some-State]:
    Locality Name (eg, city) []:Courbevoie
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:OpenAgenda
    Organizational Unit Name (eg, section) []:
    Common Name (e.g. server FQDN or YOUR name) []Kaoré
    Email Address []:kaore@openagenda.com

    Please enter the following 'extra' attributes
    to be sent with your certificate request
    A challenge password []:
    An optional company name []:

Il reste à créer le certificat de l'utilisateur. L'option -set_serial sert à préciser un identifiant. Ce doit être un entier. La date suivie d'un incrément par exemple:

    openssl x509 -req -days 365 -in kaore.csr -CA certs/ca.crt -CAkey certs/private/ca.key -set_serial 2020051001 -out clients/kaore.crt

Pour vérifier que la clé est valide, `openssl` fournit une commande:

    openssl verify -verbose -CAfile certs/ca.crt clients/kaore.crt

Si tout s'est bien déroulé, le résultat devrait ressembler à `clients/kaore.crt: OK`

On peut supprimer le csr: `rm kaore.csr`

Si le certificat doit être utilisé dans un navigateur, il doit être converti dans un format qui lui est connu: `pkcs12`.

    openssl pkcs12 -export -clcerts \
      -in clients/kaore.crt \
      -inkey clients/private/kaore.key \
      -out clients/kaore.p12

Un mot de passe d'export sera alors demandé. Il devra être saisi lors du chargement du certificat dans le navigateur.

Le p12 peut alors être fourni au client pour être chargé.

### Script

Le script peut être placé dans le dossier de base pour ne fonctionner qu'avec des chemins relatifs. il prend le nom de la clé en premier, l'identifiant 'serial' en second. Exemple: `./create_client.sh kaore 2020051001`

```
#!/bin/bash

if [ $# -lt 2 ]; then
  echo 1>&2 "$0: not enough arguments -> required are name, then identifier"
  exit 2
elif [ $# -gt 2 ]; then
  echo 1>&2 "$0: too many arguments -> required are name, then identifier"
  exit 2
fi

openssl genrsa -aes256 -passout pass:xxxx -out clients/private/$1.pass.key 4096 \
    && openssl rsa -passin pass:xxxx -in clients/private/$1.pass.key -out clients/private/$1.key \
    && rm clients/private/$1.pass.key

openssl req -new -key clients/private/$1.key -out $1.csr

openssl x509 -req -days 365 -in $1.csr -CA certs/ca.crt -CAkey certs/private/ca.key -set_serial $2 -out clients/$1.crt

rm $1.csr

openssl verify -verbose -CAfile certs/ca.crt clients/$1.crt

openssl pkcs12 -export -clcerts \
  -in clients/$1.crt \
  -inkey clients/private/$1.key \
  -out clients/$1.p12

echo "-> clients/$1.p12"
```

## Vérifications

Vérifier le client à partir de l'autorité:

    openssl verify -verbose -CAfile certs/ca.crt clients/kaore.crt



## Astuces

En cas de problème d'autentification par le serveur, il est possible d'activer le log détailler dans la configuration de nginx pour avoir le détail dans le fichier de log d'erreurs. Dans `/etc/nginx/nginx.conf`, il faut mettre `debug` en fin de référence du fichier de log correspondant:

    error_log /var/log/nginx/error.log debug;

## Liens utiles

Les algos de cryptages utilisés: https://blog.syncsort.com/2018/08/data-security/aes-vs-des-encryption-standard-3des-tdea/

Un résumé sur les extensions usuelles de certificats: https://crypto.stackexchange.com/questions/43697/what-is-the-difference-between-pem-csr-key-and-crt/43700

Le guide le plus complet pour limiter les interactions sur le terminal: https://gist.github.com/mtigas/952344
Ne précise pas que l'organisation de l'autorité doit être différente de celle du client. La compilation des certificats n'est pas nécessaire dans notre cas.

Le guide suivant va plus loin en ajoutant la gestion d'une liste de révocation: https://arcweb.co/securing-websites-nginx-and-client-side-certificate-authentication-linux/

Mise à jour d'une autorité de certification sans casser les clés liées: https://serverfault.com/questions/306345/certification-authority-root-certificate-expiry-and-renewal

Extraire des infos des certificats: https://www.shellhacks.com/decode-ssl-certificate/
