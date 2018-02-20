CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `review_id_idx` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `${schema}` (`id`, `review_id`, `created_at`, `updated_at`) VALUES
  (1, 7707, '0000-00-00 00:00:00', '0000-00-00 00:00:00');