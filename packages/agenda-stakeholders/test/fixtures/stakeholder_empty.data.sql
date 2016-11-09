CREATE TABLE IF NOT EXISTS ${schema} (
`id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `credential` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `store` longtext,
  `organization` varchar(255) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=10746 DEFAULT CHARSET=latin1;