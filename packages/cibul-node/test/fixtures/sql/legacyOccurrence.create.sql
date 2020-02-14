CREATE TABLE IF NOT EXISTS `legacy_occurrence` (
  `id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `location_id` bigint(20) NOT NULL,
  `date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=1037197 DEFAULT CHARSET=latin1;

CREATE VIEW occurrence AS SELECT * FROM legacy_occurrence;