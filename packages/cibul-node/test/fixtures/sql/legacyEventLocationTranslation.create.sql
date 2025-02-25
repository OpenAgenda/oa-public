CREATE TABLE IF NOT EXISTS `legacy_event_location_translation` (
  `id` bigint(20) NOT NULL DEFAULT '0',
  `pricing_info` varchar(255) DEFAULT NULL,
  `lang` char(2) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW event_location_translation AS SELECT * FROM legacy_event_location_translation;