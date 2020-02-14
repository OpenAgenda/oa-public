CREATE TABLE IF NOT EXISTS `legacy_event_translation` (
  `id` bigint(20) NOT NULL DEFAULT '0',
  `title` varchar(140) NOT NULL,
  `description` varchar(200) NOT NULL,
  `free_text` varchar(10000) DEFAULT NULL,
  `lang` char(2) NOT NULL DEFAULT '',
  `tags` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW event_translation AS SELECT * FROM legacy_event_translation;