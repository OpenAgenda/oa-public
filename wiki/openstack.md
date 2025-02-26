# OpenStack

Pour installer le CLI: https://docs.openstack.org/newton/user-guide/common/cli-install-openstack-command-line-clients.html

```
pip install python-openstackclient
```

Pour configurer le CLI il faut télécharger le fichier OpenStack RC.
Puis lancer la commande suivante (à ajuster) dans chaque nouveau terminal pour se connecter à OpenStack :

```
. ~/Téléchargements/app-cred-bertho-openrc.sh
```

On peut tester la connexion avec cette commande :

```
openstack container list
```

## Swift

Swift est un service de stockage de fichiers comme S3.

Le CLI s'installe comme celui d'OpenStack :

```
pip install python-swiftclient
```

On se connecte de la même manière:

```
. ~/Téléchargements/app-cred-bertho-openrc.sh
```

On peut tester la connexion avec cette commande :

```
swift capabilities
```

### Désactiver l'index des buckets

Par défaut un bucket public permet à n'importe qui de lister tous les fichiers du bucket, pour désactiver l'index d'un bucket il faut faire la commande suivante :

```
swift post <BUCKET_NAME> --read-acl ".r:*"
```

### Rclone

Rclone sert à synchroniser des fichiers entre deux services de stockage.

Pour installer rclone : https://rclone.org/install/

```
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

Le commande copy permet de copier des fichiers sans modifier les fichiers de la source, et ne met pas à jour la destination si le fichier est plus récent :

```
rclone copy aws:cibul infomaniak-swift:main \
  --update \
  --swift-no-chunk \
  --metadata \
  --transfers=32 \
  --checkers=64 \
  --s3-chunk-size=128M \
  --s3-upload-concurrency=8 \
  --progress \
  --low-level-retries=10 \
  --timeout=60s
```

### Nginx proxy

Pour configurer un proxy nginx, il faut une instance sur OpenStack (https://docs.infomaniak.cloud/compute/instances/create_linux_instance/).

Quelques commandes utiles:

```
sudo apt update
sudo apt install -y nginx
systemctl status nginx
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d storage.openagenda.com
# ajouter la tache cron
# éditer la config nginx
sudo nginx -t
sudo service nginx reload
```

Avec le cron avec `crontab -e`:

```

```

`nginx.conf`:

```
user www-data;
worker_processes auto;
worker_rlimit_nofile 2048;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 2048;
    use epoll;
	# multi_accept on;
}

http {

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	types_hash_max_size 2048;
	server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

    ##
    # SSL Settings
    ##

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
    ssl_prefer_server_ciphers on;

	# set_real_ip_from 192.168.0.0/16;
	# set_real_ip_from 10.0.0.0/8;
	# set_real_ip_from 172.16.0.0/16;
	set_real_ip_from 0.0.0.0/0; # Pas bien, on fait confiance à tout le monde mais pas le choix, on ne connais pas les ips de keycdn
	real_ip_header X-Forwarded-For;
	real_ip_recursive on;

    ##
    # Logging Settings
    ##

	log_format main 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx $remote_addr - $remote_user [$time_local] "$request" '
        '$status $body_bytes_sent "$http_referer" '
        '"$http_user_agent" "$http_x_forwarded_for"';

	error_log syslog:server=[2001:1600:0114:0000:0000:0000:0002:ec00]:514 warn;
	access_log syslog:server=[2001:1600:0114:0000:0000:0000:0002:ec00]:514,facility=local6,tag=nginx,severity=info main;

	##
	# Gzip Settings
	##

	gzip on;
	gzip_min_length 1100;
	gzip_buffers 16 8k;
	gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	client_header_timeout 10m;
	client_body_timeout 10m;
	send_timeout 10m;
	client_max_body_size 10G;
	proxy_connect_timeout 300s;
	proxy_read_timeout 300s;
	proxy_send_timeout 600s;

	connection_pool_size 256;
	large_client_header_buffers 8 16k;
	client_header_buffer_size 16k;

	request_pool_size 4k;

	output_buffers 1 32k;
	postpone_output 1460;

	keepalive_timeout 75 20;
	ignore_invalid_headers on;

	upstream standard_backend {
		server 02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud:443;
		keepalive 32;
	}

	upstream presigned_backend {
		server s3.pub1.infomaniak.cloud:443;
		keepalive 32;
	}

	# rate limited

    geo $evil_ip {
        default		0;
        52.213.80.0	1;
        52.212.2.43	1;
        3.254.153.136	1;
        54.74.112.123	1;
        34.245.234.254	1;
    }

    map $evil_ip $limited_ip {
        default "";
        1 $binary_remote_addr;
    }

    # limit_req_zone $limited_ip zone=ip:10m rate=1r/s;
    # limit_req_status 429;
    # limit_req_log_level warn;

	server {
		listen *:80;
		listen [::]:80;
		server_name storage.openagenda.com;

		access_log /var/log/nginx/access.log main;
		error_log /var/log/nginx/error.log warn;

		if ($host = storage.openagenda.com) {
			return 301 https://$host$request_uri;
		}
		return 404;
	}

	map $is_presigned $is_presigned_backend {
		default standard_backend;
		1       presigned_backend;
	}

	map $is_presigned $is_presigned_host {
		default 02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud;
		1       s3.pub1.infomaniak.cloud;
	}

	server {
		#listen 443 quic reuseport;
		listen 443 http2 ssl;
		#listen [::]:443 quic reuseport;
		listen [::]:443 http2 ssl;
		server_name storage.openagenda.com;

		ssl_certificate /etc/letsencrypt/live/storage.openagenda.com/fullchain.pem; # managed by Certbot
		ssl_certificate_key /etc/letsencrypt/live/storage.openagenda.com/privkey.pem; # managed by Certbot
		include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
		ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

		if ($evil_ip = 1) {
			return 429 "429 Too Many Requests. This IP is blacklisted, if you think this is a mistake please contact support@openagenda.com";
		}

		location / {
			# limit_req zone=ip burst=10 nodelay;

			# Preflight requests
			if ($request_method = OPTIONS) {
				add_header Access-Control-Allow-Origin "*" always;
				add_header Access-Control-Allow-Methods "GET, HEAD, PUT, POST, DELETE, OPTIONS" always;
				add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
				add_header Vary "Origin, Access-Control-Request-Headers, Access-Control-Request-Method" always;
				return 204;
			}

			set $is_presigned "0";

			# Identify presigned requests
			if ($arg_X-Amz-Algorithm) {
				set $is_presigned "1";
			}
			if ($arg_Signature) {
				set $is_presigned "1";
			}

			proxy_pass https://$is_presigned_backend$request_uri;
			proxy_http_version 1.1;
			proxy_set_header Host $is_presigned_host;
			proxy_set_header Connection "";
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;

			add_header Access-Control-Allow-Origin "$http_origin" always;
			add_header Access-Control-Allow-Credentials "true" always;
			add_header Access-Control-Expose-Headers "ETag, Content-Length, Content-Range" always;

			# Optional cache settings
			proxy_cache_bypass $http_upgrade;
			proxy_cache_convert_head off;
		}
	}

	##
	# Virtual Host Configs
	##

	# include /etc/nginx/conf.d/*.conf;
	# include /etc/nginx/sites-enabled/*;
}
```
