CREATE TABLE IF NOT EXISTS `reviewer` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `user_uid` bigint(20) DEFAULT NULL,
  `review_id` bigint(20) NOT NULL,
  `agenda_uid` bigint(20) NOT NULL,
  `credential` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `store` longtext,
  `organization` varchar(255) DEFAULT NULL,
  `creator_id` bigint(20) DEFAULT NULL,
  `deleted_user` tinyint(1) DEFAULT '0',
  `actions_counter` smallint(6) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=71390 DEFAULT CHARSET=latin1;

ALTER TABLE `reviewer` ADD PRIMARY KEY (`id`), ADD KEY `user_id_idx` (`user_id`), ADD KEY `review_id_idx` (`review_id`);
