CREATE TABLE IF NOT EXISTS `legacy_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `image_credits` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `origin_uid` bigint(20),
  `file_key` varchar(32),
  `store` longtext,
  `eve_id` varchar(100) DEFAULT NULL,
  `custom_fields` text,
  `age_min` smallint(6) DEFAULT NULL,
  `age_max` smallint(6) DEFAULT NULL,
  `accessibility` varchar(255) DEFAULT NULL,
  `type` varchar(2) DEFAULT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW event AS SELECT * FROM legacy_event;