## Server Configuration


Nginx must run both sf1.4 and node projects. First location clause preselects which requests go to node project ( process listening to a given port, here 8901)

Config sample:

    server {
      listen 443;

      ssl on;
      ssl_certificate      /home/kaore/.ssh/authorized_keys/d.cibul.net/d.cibul.net.crt;
      ssl_certificate_key  /home/kaore/.ssh/authorized_keys/d.cibul.net/d.cibul.net.key;

      server_name d.cibul.net;
     
      root /home/kaore/Dev/www/cibul-symfony/web;

      
      location ~ ^/($|.+/(admin/newsletters|newsletters)|(events|agendas)/search) {
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


## App General Structure

### server.js

The app general launcher. It loads the router, transversal coms and each module app giving them general configuration info (config.js)

### Modules

The general app is broken down into modules, each in its own folder. Right now the modules are

* **Newsletter**: handles administration, rendering and scheduling of agenda newsletter
* **Search**: handles search pages and background tasks
* **General**: displays general purpose pages (for example: site presentation, 404, 500 pages)
* **Mailer**: handles email sending for entire app

### Typical module structure

Some ground rules for writing a module:

* The following writing rules should be followed: https://github.com/rwaldron/idiomatic.js/
* Exposed functions should be listed at the top of the file as much as possible
* Libraries and constants should be loaded in the global module namespace
* Other variables should not be declared in the global module namespace
* Unexposed functions should start with an underscore

### App Module structure

server.js loads two types of module files:

* **Express sub apps**: web apps which match a given base route. They should be named front.js ( meaning openly accessible ), back.js ( administration 

* **Tasks**: scripts that will be run either at the general server launch or periodically 
  
Other module files are libraries used by the two types listed above.

## Routing

The routing matches uris with urls used in views and handles redirects. It attaches an url generator function through a middleware that can be called at the launch of any app module express app. Once attached to the request, the url generator (req.genUrl) is capable of generating urls...

* relative to the current module
* general to the entire application (cross-module)

It is used anywhere in templates where urls need to be rendered.


## coms.js

Module used by any module needing to publish or subscribe to application-wide message channels

2 types of communication are used:

* persistent consumer queue: used by mailer. On one side, mailer connects to the queue and keeps on popping items as they arrive by using the 'persistentConsume' method of coms. On the second side, any module needing to send email messages queues them with the 'queue' method of coms. The queue name for this is 'mailer'.

* channel publish / subscribe: the application wide channel is called 'main' and is used for applicative events ( for example: 'event.create', 'event.remove' ). Event originators use coms method 'publish' to push things on the channel. Listeners 'subscribe' to the channel to follow what is happening. A log stack piles anything that goes through here and dumps data regularly to the file system.



### middleware

A middleware.js file groups common functions regularly used throughout module request handlings. Here is an extract:

* **render** : render a view (views are defined in cibul-templates project)
* **requiredLogged** : middleware that verifies that user is signed in
* **loadAgenda** : loads an agenda instance using the slug parameter in the request ( using the cibulModel lib ) 


## I18n

Translation indexes are mostly located in the template project as they tend to be page-specific. Some labels which need to be reused throughout the application for redirection messages are indexed in the i18n folder of the server project.

## Rendering templates

A specific project is defined for all thinhs 'frontend' . It exposes a 'templater' module to the server app that is used in the **render** function of **middleware.js**. In a typical controller, once the data is made ready, it is given to that function which callsback rendered html content.

## Error handling

There is a 404 and 500 page in the 'general' app module. The handling of errors is still sketchy, how the newsletter app 'back.js' proceeds with this should serve as a guideline for now. Promises (using the 'when' lib) avoid the need to control errors at each callback.


## Misc

Rules for image paths