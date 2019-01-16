CREATE TABLE IF NOT EXISTS `event_2` (
  `id` bigint(20) NOT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `location_uid` bigint(20) DEFAULT NULL,
  `timezone` varchar(255) NOT NULL,
  `timings` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
