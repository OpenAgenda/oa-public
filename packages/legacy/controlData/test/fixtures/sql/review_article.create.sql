CREATE TABLE IF NOT EXISTS `review_article` (
  `id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `event_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` bigint(20) DEFAULT NULL,
  `state` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=887122 DEFAULT CHARSET=utf8;
