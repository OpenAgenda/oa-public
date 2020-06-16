create table if not exists event_editor (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `event_id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `created_at` datetime,
  `updated_at` datetime,
  `type` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
