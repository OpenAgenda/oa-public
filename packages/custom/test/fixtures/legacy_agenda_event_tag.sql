CREATE TABLE IF NOT EXISTS `legacy_agenda_event_tag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_article_id` bigint(20) NOT NULL,
  `review_tag_id` bigint(20) NOT NULL,
  `updated_at` datetime not null,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `legacy_agenda_event_tag` ( id, review_article_id, review_tag_id ) values
(3432649, 1743417, 27690 ),
(3432650, 1743417, 27696 ),
(3432651, 1743417, 27697 );