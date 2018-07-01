CREATE TABLE IF NOT EXISTS `legacy_agenda_event` (
  `id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `legacy_agenda_event` (`id`, `review_id`, `event_id`, `category_id` ) VALUES
(111, 1010101, 147621, NULL ),
(1743417, 13866, 395113, 123 );