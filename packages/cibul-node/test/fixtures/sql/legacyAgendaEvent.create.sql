CREATE TABLE IF NOT EXISTS `legacy_agenda_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `content` mediumtext,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `store` longtext,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` bigint(20) DEFAULT NULL,
  `facebook_id` bigint(20) DEFAULT NULL,
  `state` tinyint(4) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  primary key (id)
) ENGINE=InnoDB AUTO_INCREMENT=887122 DEFAULT CHARSET=utf8;

CREATE VIEW review_article AS SELECT * FROM legacy_agenda_event;
