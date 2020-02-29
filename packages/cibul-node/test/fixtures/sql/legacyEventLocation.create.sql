CREATE TABLE IF NOT EXISTS `legacy_event_location` (
  `event_id` bigint(20) NOT NULL DEFAULT '0',
  `location_id` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ticket_link` varchar(255) DEFAULT NULL,
  `id` bigint(20) NOT NULL auto_increment,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW event_location AS SELECT * FROM legacy_event_location;
