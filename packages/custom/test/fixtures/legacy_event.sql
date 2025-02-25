CREATE TABLE IF NOT EXISTS `legacy_event` (
  `id` bigint(20) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `image_credits` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `origin_uid` bigint(20),
  `file_key` varchar(32),
  `store` longtext,
  `eve_id` varchar(100) DEFAULT NULL,
  `custom_fields` text,
  `age_min` smallint(6) DEFAULT NULL,
  `age_max` smallint(6) DEFAULT NULL,
  `accessibility` varchar(255) DEFAULT NULL,
  `type` varchar(2) DEFAULT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `${schema}` (`id`, `uid`, `slug`, `url`, `image`, `background_image`, `background_color`, `owner_id`, `is_published`, `is_new`, `created_at`, `updated_at`, `store`, `eve_id`, `custom_fields`, `age_min`, `age_max`, `accessibility`, `type`, `origin_uid`, `file_key`, `image_credits` ) VALUES
(147621, 27434489, 'indoor-de-paris-cso-pro-1',
  NULL, 'event_indoor-de-paris-cso-pro-1_563851.jpg', NULL, NULL, 27645, 1, 0, '2016-10-14 15:01:00', '2016-10-14 15:01:01', 
  '{"customFields":{"custom_description" : "Joooohnnyyyyy!"}}',
  NULL, NULL, NULL, NULL, '["mi","hi","sl"]', NULL, 48959239, 'reai4iufo57yuqo3fdy6qqoi5fy3iqo', '@gaetan 2017' ),
(147620, 31259734, 'indoor-de-paris-pro-3', NULL, 'event_indoor-de-paris-pro-3_625276.jpg', NULL, NULL, 27645, 1, 0, '2016-10-14 14:48:53', '2016-10-14 14:49:25', 
 '{}', NULL, '', NULL, NULL, '', '', 48959239, NULL, NULL ),
(147619, 955726, 'loto-intergenerationnel', NULL, 'event_loto-intergenerationnel_933467.jpg', NULL, NULL, 27735, 1, 0, '2016-10-14 14:29:55', '2016-10-14 14:29:55', 'a:3:{s:10:"imageThumb";s:44:"evtbevent_loto-intergenerationnel_933467.jpg";s:9:"imageFull";s:43:"evfevent_loto-intergenerationnel_933467.jpg";s:5:"links";s:2:"[]";}', NULL, NULL, NULL, NULL, NULL, NULL, 48959239, NULL, NULL ),
(196601, 17909604, 'visite-commentee-de-la-bibliotheque-universitaire-du-havre', NULL, 'event_visite-commentee-de-la-bibliotheque-universitaire-du-havre_929160.jpg', NULL, NULL, 23807, 0, 0, '2017-05-29 15:58:16', '2017-05-29 15:58:17', 'a:3:{s:10:"imageThumb";s:79:"evtbevent_visite-commentee-de-la-bibliotheque-universitaire-du-havre_929160.jpg";s:9:"imageFull";s:78:"evfevent_visite-commentee-de-la-bibliotheque-universitaire-du-havre_929160.jpg";s:5:"links";s:2:"[]";}', NULL, '{"creditsimage":"Direction de la Communication de l\'universit\\u00e9 du Havre"}', 0, 99, NULL, NULL, 66056061, NULL, NULL );


#salons
insert into `${schema}` (`id`, `uid`, `custom_fields`) values
(395113, 3842071, '{"unitesrecherche":"3 ou 4","animateurs":"Steve et Chirie","organisateur":"CHU de Steve"}');