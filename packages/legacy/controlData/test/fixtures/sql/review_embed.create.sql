CREATE TABLE IF NOT EXISTS `review_embed` (
`id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `store` longtext,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `version` smallint(6) DEFAULT '2',
  `template` text,
  `mapping` text
) ENGINE=InnoDB AUTO_INCREMENT=2577 DEFAULT CHARSET=utf8;
