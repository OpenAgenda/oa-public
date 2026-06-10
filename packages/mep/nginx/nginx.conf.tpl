user nginx;
worker_processes  auto;
worker_rlimit_nofile 4096;
load_module modules/ngx_stream_module.so;
#load_module modules/ngx_http_modsecurity_module.so;

error_log /var/log/nginx/error_log info;

events {
    worker_connections  2048;
    use epoll;
}

http {
    upstream api_servers {<% APIEndpoints.forEach(endpoint => { %>
        server <%= endpoint %>;<% }); %>
        keepalive <%= APIEndpoints.length * 2 %>;
    }
    upstream next_servers {<% NextEndpoints.forEach(endpoint => { %>
        server <%= endpoint %>;<% }); %>
        keepalive <%= NextEndpoints.length * 2 %>;
    }
    upstream web_servers {<% WebEndpoints.forEach(endpoint => { %>
        server <%= endpoint %>;<% }); %>
        keepalive <%= WebEndpoints.length * 2 %>;
    }

    include /etc/nginx/mime.types;

    keepalive_timeout 55s;

    map $http_x_forwarded_proto $real_scheme {
        default $http_x_forwarded_proto;
        '' $scheme;
    }

################### main site - HTTPS (external) #####################
    server {
        listen 80;

        server_name <%= domain %>;

        if ($real_scheme != "https") {
            return 301 https://$server_name$request_uri;
        }

        include conf.d/common;
        include conf.d/server_params;
    }

################### main site - HTTP (internal) #####################
    server {
        listen <%= internalServerPort %>;

        server_name _;


        include conf.d/common;
        location / {
            include conf.d/nodejs_params;
        }
    }

####################### API #######################
    server {
        listen 80;

        server_name <%= APIDomain %> <%= additionalAPIDomains %>;

        if ($real_scheme != "https") {
            return 301 https://$server_name$request_uri;
        }

        access_log /var/log/nginx/<%= APIDomain %>.access.log;
        error_log /var/log/nginx/<%= APIDomain %>.error.log;

        client_max_body_size 20m;
        large_client_header_buffers 4 16k;

        location / {
            return 301 https://developers.openagenda.com;
        }

        location /v2 {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';

            proxy_http_version 1.1;
            proxy_set_header "Connection" "";
            proxy_pass http://api_servers;
        }

        location /v3 {
            # CORS lives here (edge), as for /v2. Three additions over the base
            # policy let an in-browser API explorer (Scalar docs) run
            # authenticated requests:
            #   1. `Authorization` in Allow-Headers — a Bearer credential makes
            #      the request non-simple, so the browser preflights and checks
            #      this list; `Authorization` is never covered by a wildcard.
            #   2. An explicit OPTIONS → 204 short-circuit — the v3 app answers
            #      OPTIONS with 404 (its catch-all shadows Express's
            #      auto-OPTIONS), and a non-2xx preflight fails regardless of
            #      headers. Answer it at the edge instead.
            #   3. `always` — so the headers ride 4xx too; a 401/403 body stays
            #      readable in the explorer instead of an opaque network error.
            # Anonymous simple GETs (the prior behaviour) are unaffected.
            # Keep in sync with docker/nginx/api.conf (dev edge).
            if ($request_method = OPTIONS) {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
                add_header 'Access-Control-Max-Age' 600;
                add_header 'Content-Length' 0;
                return 204;
            }

            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

            proxy_http_version 1.1;
            proxy_set_header "Connection" "";
            proxy_pass http://api_servers;
        }
    }
}
