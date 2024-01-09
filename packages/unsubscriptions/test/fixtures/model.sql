CREATE TABLE unsubscription (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE unsubscription_link (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(36) NOT NULL,
  `target` text NOT NULL,
  `rule` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE unsubscribed (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;