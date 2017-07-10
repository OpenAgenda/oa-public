CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `store` longtext,
  `eve_id` varchar(100) DEFAULT NULL,
  `custom_fields` text,
  `age_min` smallint(6) DEFAULT NULL,
  `age_max` smallint(6) DEFAULT NULL,
  `accessibility` varchar(255) DEFAULT NULL,
  `type` varchar(2) DEFAULT NULL,
  `origin_uid` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `${schema}`
--

INSERT INTO `${schema}` (`id`, `custom_fields`) VALUES
(80445, '{"citation":"Celle de participer \\u00e0 une journ\\u00e9e digne de notre sport ! ","quisuisje":"club","participants":"200"}'),

-- for testing multichoice transfer
( 152412, '{"detailedcoms":"Avec Cetim, Symop, CeA List, Mbway ( soutien Arts et M\\u00e9tiers Alumni)","organizertype":"enseignementsuperieur","expectedcount":"75","otherorganizer":"Expert Robot Start PmE, labellis\\u00e9 Industrie du futur, intervenant dans l''\\u00e9cole Mbway"}' ),

-- for testing checkbox transfer
(166062, '{"custom_description":"hip"}'),
(186834, '{"recurring":"","intermunicipal_interest":true}');