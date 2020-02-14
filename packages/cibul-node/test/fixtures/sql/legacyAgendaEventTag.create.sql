CREATE TABLE IF NOT EXISTS `legacy_agenda_event_tag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_article_id` bigint(20) NOT NULL,
  `review_tag_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE VIEW review_tag_article AS SELECT * FROM legacy_agenda_event_tag;