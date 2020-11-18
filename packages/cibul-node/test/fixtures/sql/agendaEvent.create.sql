CREATE TABLE IF NOT EXISTS `agenda_event` (
  `id` bigint(20) NOT NULL auto_increment,
  `agenda_uid` bigint(20) NOT NULL,
  `can_edit` tinyint(1) NOT NULL DEFAULT '0',
  `event_uid` bigint(20) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `legacy_id` varchar(30) DEFAULT NULL,
  `user_uid` bigint(20) DEFAULT NULL,
  `source_agenda_uid` varchar(300),
  `aggregated` tinyint(1) default 0,
  primary key ( id )
) ENGINE=InnoDB AUTO_INCREMENT=954070 DEFAULT CHARSET=utf8;
