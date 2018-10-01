CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `review_id` bigint(20) NOT NULL,
  `credential` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `store` longtext,
  `organization` varchar(255) DEFAULT NULL,
  `creator_id` bigint(20) DEFAULT NULL,
  `deleted_user` tinyint(1) DEFAULT '0',
  `actions_counter` smallint(6) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
