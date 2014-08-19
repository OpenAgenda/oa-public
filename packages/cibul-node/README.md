## coms

Module used by any module needing to publish or subscribe to application-wide message channels

2 types of communication are used:

* persistent consumer queue: used by mailer. On one side, mailer connects to the queue and keeps on popping items as they arrive by using the 'persistentConsume' method of coms. On the second side, any module needing to send email messages queues them with the 'queue' method of coms. The queue name for this is 'mailer'.

* channel publish / subscribe: the application wide channel is called 'main' and is used for applicative events ( for example: 'event.create', 'event.remove' ). Event originators use coms method 'publish' to push things on the channel. Listeners 'subscribe' to the channel to follow what is happening. A log stack piles anything that goes through here and dumps data regularly to the file system.


## nginx configuration


Nginx must run both sf1.4 and node projects. First location clause preselects which requests go to node project ( process listening to a given port, here 8901)

Config sample:

server {
  listen 80;

  server_name d.cibul.net;
 
  root /home/kaore/Dev/www/cibul-symfony/web;

  location ~ "/[^/]+(/admin/newsletters|/newsletters)" {
    proxy_pass http://127.0.0.1:8901;
    proxy_set_header Host $host;
    proxy_buffering off;
  }

  location / {
      try_files $uri $uri/ /index.php$uri?$args;
  }
  location ^~ /sf/ {
      alias /var/lib/symfony/data/web/sf/;
  }
  location ~ "^(.+\.php)($|/)" {
      fastcgi_split_path_info ^(.+\.php)(.*)$;

      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      fastcgi_param SCRIPT_NAME $fastcgi_script_name;
      fastcgi_param PATH_INFO $fastcgi_path_info;
      fastcgi_pass   127.0.0.1:9000;
      include        fastcgi_params;
  }

  location ~ /\.ht {
    deny all;
  }  

}

server {
  listen 443;

  ssl on;
  ssl_certificate      /home/kaore/.ssh/authorized_keys/d.cibul.net/d.cibul.net.crt;
  ssl_certificate_key  /home/kaore/.ssh/authorized_keys/d.cibul.net/d.cibul.net.key;

  server_name d.cibul.net;
 
  root /home/kaore/Dev/www/cibul-symfony/web;

  location / {
      try_files $uri $uri/ /index.php$uri?$args;
  }
  location ^~ /sf/ {
      alias /var/lib/symfony/data/web/sf/;
  }
  location ~ "^(.+\.php)($|/)" {
      fastcgi_split_path_info ^(.+\.php)(.*)$;

      fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
      fastcgi_param SCRIPT_NAME $fastcgi_script_name;
      fastcgi_param PATH_INFO $fastcgi_path_info;
      fastcgi_pass   127.0.0.1:9000;
      include        fastcgi_params;
  }

  location ~ /\.ht {
    deny all;
  }  

}