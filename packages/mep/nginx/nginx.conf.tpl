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
    upstream api_servers {<% APIEndpoints.forEach(ep => { %>
        server <%= ep %>:<%= serverPort %>;<% }); %>
        keepalive <%= APIEndpoints.length * 2 %>;
    }
    upstream next_servers {<% NextEndpoints.forEach(ep => { %>
        server <%= ep %>:<%= serverPort %>;<% }); %>
        keepalive <%= NextEndpoints.length * 2 %>;
    }
    upstream web_servers {<% WebEndpoints.forEach(ep => { %>
        server <%= ep %>:<%= serverPort %>;<% }); %>
        keepalive <%= WebEndpoints.length * 2 %>;
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

####################### API #######################
    server {
        listen 80;

        server_name <%= APIDomain %>;

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
    }
}