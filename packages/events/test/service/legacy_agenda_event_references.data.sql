CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL,
  `agenda_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `ref_event_id` bigint(20) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=887122 DEFAULT CHARSET=utf8;

INSERT INTO `${schema}` (`id`, `agenda_id`, `event_id`, `ref_event_id` ) VALUES
(1, 7081, 147621, 145552 ),
(2, 7081, 147621, 147620 );
