user nginx;
worker_processes  auto;
worker_rlimit_nofile 2048;
load_module modules/ngx_stream_module.so;
#load_module modules/ngx_http_modsecurity_module.so;

error_log /var/log/nginx/error_log info;

events {
    worker_connections  2048;
    use epoll;
}

http {
    upstream api_servers {
        server <%= APIEndpoint %>:<%= serverPort %>;
    }
    upstream next_servers {
        server <%= NextEndpoint %>:<%= serverPort %>;
    }
    upstream web_servers {
        server <%= WebEndpoint %>:<%= serverPort %>;
    }

    include /etc/nginx/mime.types;

    map $http_x_forwarded_proto $real_scheme {
        default $http_x_forwarded_proto;
        '' $scheme;
    }

################### main site #####################
    server {
        listen 80;

        server_name <%= domain %>;

        if ($real_scheme != "https") {
            return 301 https://$server_name$request_uri;
        }

        include conf.d/server_params;
    }

    server {
        server_name <%= domain %>;
        
        ssl_certificate      /var/lib/jelastic/SSL/jelastic.chain;
        ssl_certificate_key  /var/lib/jelastic/SSL/jelastic.key;

        listen [::]:443 ssl ipv6only=on; # managed by Certbot
        listen 443 ssl default_server; # managed by Certbot

        include conf.d/server_params;
    }

####################### API #######################
    server {
        listen 80;

        server_name <%= APIDomain %>;

        if ($real_scheme != "https") {
            return 301 https://$server_name$request_uri;
        }

        include conf.d/server_params;
    }

    server {
        listen 443;
        server_name <%= APIDomain %>;

        access_log /var/log/nginx/<%= APIDomain %>.access.log;
        error_log /var/log/nginx/<%= APIDomain %>.error.log;

        client_max_body_size 20m;
        
        ssl_certificate      /var/lib/jelastic/SSL/jelastic.chain;
        ssl_certificate_key  /var/lib/jelastic/SSL/jelastic.key;

        location / {
            return 301 https://developers.openagenda.com;
        }

        location /v2 {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';

            proxy_pass http://api_servers;
            proxy_set_header  Host              $host;
            proxy_set_header  X-Real-IP         $remote_addr;
            proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header  X-Forwarded-Proto $scheme;
            proxy_buffering off;
        }
    }
}