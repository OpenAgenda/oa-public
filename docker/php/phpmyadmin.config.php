<?php

declare(strict_types=1);

$cfg['blowfish_secret'] = '99bottlesofbeeronthewall99bottlesofbeeronefellwhatthehell98bottlesofbeeronthewall';

$i = 0;
$i++;

/* Authentication type */
$cfg['Servers'][$i]['auth_type'] = 'cookie';
/* Server parameters */
$cfg['Servers'][$i]['host'] = getenv('PMA_HOST');
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

$cfg['Servers'][$i]['ssl'] = true;
$cfg['Servers'][$i]['ssl_verify'] = false;
$cfg['Servers'][$i]['ssl_key'] = getenv('PMA_SSL_KEY');
$cfg['Servers'][$i]['ssl_cert'] = getenv('PMA_SSL_CERT');
$cfg['Servers'][$i]['ssl_ca'] = getenv('PMA_SSL_CA');


error_log(print_r($cfg, TRUE));
