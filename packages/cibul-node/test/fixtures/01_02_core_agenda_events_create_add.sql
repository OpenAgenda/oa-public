drop database if exists oatest;
create database if not exists oatest;
use oatest;

CREATE TABLE agenda (
  id BIGINT AUTO_INCREMENT,
  uid BIGINT UNIQUE,
  main TINYINT(1) DEFAULT '0' NOT NULL,
  official TINYINT(1) DEFAULT '0' NOT NULL,
  officialized_at DATETIME,
  private TINYINT(1) DEFAULT '0' NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id BIGINT NOT NULL,
  form_schema_id BIGINT,
  network_uid BIGINT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(165), /* 150 in real world */
  image VARCHAR(255),
  url VARCHAR(255),
  collaborative TINYINT(1) DEFAULT '0' NOT NULL,
  contribution_type TINYINT DEFAULT 0 NOT NULL,
  contribution_info TEXT,
  store TEXT,
  indexed TINYINT DEFAULT 1,
  credentials TEXT,
  settings TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX owner_id_idx (owner_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;


INSERT INTO agenda (
  `id`,
  `title`,
  `owner_id`,
  `slug`,
  `description`,
  `image`,
  `url`,
  `collaborative`,
  `created_at`,
  `updated_at`,
  `uid`,
  `main`,
  `store`,
  `contribution_type`,
  `contribution_info`,
  `official`,
  `private`,
  `credentials`,
  `form_schema_id`,
  `settings`
) VALUES

(
  218,
  'La Gargouille',
  50304,
  'la-gargouille',
  'Une petite description',
  NULL,
  '',
  0,
  '2016-01-11 13:07:08',
  '2016-01-18 16:14:06',
  17026855,
  0,
  '{"moderated":false,"send_invitation_email":true,"contributorconfigstep":1}',
  2,
  NULL,
  0,
  0,
  '{}',
  2,
  '{"contribution":{"type":1}}'
),

(
  219,
  'La Gourgaille',
  50304,
  'la-gourgaille',
  'Une description petite',
  NULL,
  '',
  0,
  '2016-01-11 13:07:08',
  '2016-01-18 16:14:06',
  55268170,
  0,
  '{"moderated":false,"send_invitation_email":true,"contributorconfigstep":1}',
  2,
  NULL,
  0,
  0,
  '{}',
  3,
  '{}'
);



CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `full_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `facebook_uid` varchar(255) DEFAULT NULL,
  `twitter_screen_name` varchar(255) DEFAULT NULL,
  `culture` varchar(5) DEFAULT NULL,
  `is_activated` tinyint(1) DEFAULT '0',
  `main` varchar(2) DEFAULT NULL,
  `password` varchar(40) NOT NULL,
  `salt` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `last_notified` datetime DEFAULT NULL,
  `is_removed` tinyint(1) NOT NULL DEFAULT '0',
  `store` longtext,
  `api_key` varchar(32) DEFAULT NULL,
  `is_basic` tinyint(1) NOT NULL DEFAULT '0',
  `twitter_id` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `last_signin` datetime DEFAULT NULL,
  `comexposium_id` varchar(255) DEFAULT NULL,
  `is_new` tinyint(4) DEFAULT '1',
  `last_inbox_check` datetime DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=50305 DEFAULT CHARSET=utf8;


INSERT INTO `user` (`id`, `full_name`, `username`, `email`, `image`, `facebook_uid`, `twitter_screen_name`, `culture`, `is_activated`, `main`, `password`, `salt`, `created_at`, `updated_at`, `last_notified`, `is_removed`, `store`, `api_key`, `is_basic`, `twitter_id`, `google_id`, `uid`, `last_signin`, `comexposium_id`, `is_new`) VALUES
(50304, 'steve', 'steve4460', 'steve@oa.com', NULL, NULL, NULL, 'fr', 1, NULL, 'a3bcf2ede1e72cf6123d1226d5d079bf03b68d65', '6OLumvJLubAklsDhuJJiuVQJTAX8MfF3', '2017-11-15 15:50:11', '2017-11-15 15:50:30', NULL, 0, NULL, NULL, 0, NULL, NULL, 63170203, '2017-11-15 15:50:30', NULL, 1),
(50300, 'janine', 'Janine', 'janine@oa.com', NULL, NULL, NULL, 'fr', 1, NULL, 'a3bcf2ede1e72cf6123d1226d5d079bf03b68d65', '6OLumvJLubAklsDhuJJiuVQJTAX8MfF3', '2017-11-15 15:50:11', '2017-11-15 15:50:30', NULL, 0, NULL, NULL, 0, NULL, NULL, 63170200, '2017-11-15 15:50:30', NULL, 1);

ALTER TABLE `user` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id_idx` (`id`), ADD UNIQUE KEY `username` (`username`), ADD UNIQUE KEY `email` (`email`), ADD UNIQUE KEY `email_idx` (`email`), ADD UNIQUE KEY `uid` (`uid`);


CREATE TABLE IF NOT EXISTS `form_schema` (
  `id` bigint(20) NOT NULL,
  `store` longtext
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

INSERT INTO `form_schema` (`id`, `store`) VALUES
(2, '{"nextOptionId":61,"fields":[{"field":"custom_description","label":{"fr":"Description personnalisée","en":"Custom description"},"info":null,"write":"contributor","read":null,"optional":true,"origin":"custom","min":null,"max":null,"fieldType":"textarea"},{"field":"title","fieldType":"abstract"},{"field":"location","fieldType":"abstract"},{"field":"intermunicipal_interest","label":{"fr":"Événement d''intérêt intercommunal","en":"Event of inter-municipal interest"},"info":null,"write":"contributor","read":null,"optional":true,"origin":"custom","min":null,"max":null,"options":[{"id":1,"value":"true","label":{"fr":"Événement d''intérêt intercommunal","en":"Event of inter-municipal interest"},"legacyId":null}],"fieldType":"checkbox"},{"field":"recurring","label":{"fr":"Événement récurrent","en":"Recurring Event"},"info":null,"write":"contributor","read":null,"optional":true,"origin":"custom","min":null,"max":null,"options":[{"id":2,"value":"true","label":{"fr":"Événement récurrent","en":"Recurring Event"},"legacyId":null}],"fieldType":"checkbox"},{"field":"thematiques-bordeaux-metropole","label":{"fr":"Thématiques Bordeaux Métropole"},"info":null,"write":"contributor","read":null,"optional":true,"origin":"tags","min":null,"max":null,"options":[{"id":3,"value":"administration","label":{"fr":"Administration"},"legacyId":9661},{"id":4,"value":"aeronautique","label":{"fr":"Aéronautique"},"legacyId":9662},{"id":5,"value":"agroalimentaire","label":{"fr":"Agroalimentaire"},"legacyId":9663},{"id":6,"value":"archeologie-preventive","label":{"fr":"Archéologie préventive"},"legacyId":9664},{"id":7,"value":"citoyennete","label":{"fr":"Citoyenneté"},"legacyId":9665},{"id":8,"value":"consommation-denergie","label":{"fr":"Consommation d’énergie"},"legacyId":9666},{"id":9,"value":"culture","label":{"fr":"Culture"},"legacyId":9667},{"id":10,"value":"dechets-recyclage","label":{"fr":"Déchets - Recyclage"},"legacyId":9668},{"id":11,"value":"developpement-durable","label":{"fr":"Développement durable"},"legacyId":9669},{"id":12,"value":"eau-et-assainissement","label":{"fr":"Eau et assainissement"},"legacyId":9670},{"id":13,"value":"economie","label":{"fr":"Économie"},"legacyId":9671},{"id":14,"value":"education-enseignement","label":{"fr":"Éducation - Enseignement"},"legacyId":9672},{"id":15,"value":"emploi","label":{"fr":"Emploi"},"legacyId":9673},{"id":16,"value":"enfance","label":{"fr":"Enfance"},"legacyId":9674},{"id":17,"value":"environnement","label":{"fr":"Environnement"},"legacyId":9675},{"id":18,"value":"finances","label":{"fr":"Finances"},"legacyId":9676},{"id":19,"value":"grand-projet","label":{"fr":"Grand projet"},"legacyId":9677},{"id":20,"value":"habitat","label":{"fr":"Habitat"},"legacyId":9678},{"id":21,"value":"innovation","label":{"fr":"Innovation"},"legacyId":9679},{"id":22,"value":"international","label":{"fr":"International"},"legacyId":9680},{"id":23,"value":"loisirs","label":{"fr":"Loisirs"},"legacyId":9681},{"id":24,"value":"metropole","label":{"fr":"Métropole"},"legacyId":9682},{"id":25,"value":"nature","label":{"fr":"Nature"},"legacyId":9683},{"id":26,"value":"nautisme-garonne","label":{"fr":"Nautisme - Garonne"},"legacyId":9684},{"id":27,"value":"numerique","label":{"fr":"Numérique"},"legacyId":9685},{"id":28,"value":"oim","label":{"fr":"OIM"},"legacyId":9686},{"id":29,"value":"participation","label":{"fr":"Participation"},"legacyId":9687},{"id":30,"value":"patrimoine","label":{"fr":"Patrimoine"},"legacyId":9688},{"id":31,"value":"politique","label":{"fr":"Politique"},"legacyId":9689},{"id":32,"value":"sante","label":{"fr":"Santé"},"legacyId":9690},{"id":33,"value":"solidarite","label":{"fr":"Solidarité"},"legacyId":9691},{"id":34,"value":"sport","label":{"fr":"Sport"},"legacyId":9692},{"id":35,"value":"tertiaire","label":{"fr":"Tertiaire"},"legacyId":9693},{"id":36,"value":"tourisme","label":{"fr":"Tourisme"},"legacyId":9694},{"id":37,"value":"tramway","label":{"fr":"Tramway"},"legacyId":9695},{"id":38,"value":"transports-deplacements","label":{"fr":"Transports - Déplacements"},"legacyId":9696},{"id":39,"value":"travaux-chantiers","label":{"fr":"Travaux - chantiers"},"legacyId":9697},{"id":40,"value":"urbanisme","label":{"fr":"Urbanisme"},"legacyId":9698},{"id":41,"value":"vie-associative","label":{"fr":"Vie associative"},"legacyId":9699}],"fieldType":"checkbox"},{"field":"bordeaux-metropole","label":{"fr":"Bordeaux Métropole"},"info":null,"write":"contributor","read":null,"optional":true,"origin":"tags","min":null,"max":null,"options":[],"fieldType":"checkbox"},{"field":"categories-agenda-metropolitain","label":{"fr":"Catégories Agenda Métropolitain"},"info":null,"write":"contributor","read":null,"optional":false,"origin":"categories","options":[{"id":42,"value":"animation-loto","label":{"fr":"Animation - Loto"},"legacyId":3454},{"id":43,"value":"atelier","label":{"fr":"Atelier"},"legacyId":3455},{"id":44,"value":"ceremonie","label":{"fr":"Cérémonie"},"legacyId":3456},{"id":45,"value":"cinema-projection","label":{"fr":"Cinéma - Projection"},"legacyId":3457},{"id":46,"value":"concert","label":{"fr":"Concert"},"legacyId":3458},{"id":47,"value":"conference-rencontre","label":{"fr":"Conférence - Rencontre"},"legacyId":3459},{"id":48,"value":"congres-colloque","label":{"fr":"Congrès - Colloque"},"legacyId":3460},{"id":49,"value":"conseil-de-metropole","label":{"fr":"Conseil de métropole"},"legacyId":3461},{"id":50,"value":"conseil-municipal","label":{"fr":"Conseil municipal"},"legacyId":3462},{"id":51,"value":"evenement-sportif","label":{"fr":"Événement sportif"},"legacyId":3463},{"id":52,"value":"exposition","label":{"fr":"Exposition"},"legacyId":3464},{"id":53,"value":"fete-festival","label":{"fr":"Fête - Festival"},"legacyId":3465},{"id":54,"value":"foire-salon","label":{"fr":"Foire - Salon"},"legacyId":3466},{"id":55,"value":"inauguration","label":{"fr":"Inauguration"},"legacyId":3467},{"id":56,"value":"lecture","label":{"fr":"Lecture"},"legacyId":3468},{"id":57,"value":"marche-brocante-vide-grenier","label":{"fr":"Marché-Brocante - Vide grenier"},"legacyId":3469},{"id":58,"value":"reunion-publique","label":{"fr":"Réunion publique"},"legacyId":3470},{"id":59,"value":"spectacle","label":{"fr":"Spectacle"},"legacyId":3471},{"id":60,"value":"visite-balade","label":{"fr":"Visite - Balade"},"legacyId":3472}],"fieldType":"radio"}]}'),

(3, '{"nextOptionId":1,"fields":[]}');


ALTER TABLE `form_schema` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id_idx` (`id`);

ALTER TABLE `form_schema` MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;


CREATE TABLE IF NOT EXISTS `member` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `review_id` bigint(20) NOT NULL,
  `credential` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `store` longtext,
  `slug` varchar(255),
  `organization` varchar(255) DEFAULT NULL,
  `creator_id` bigint(20) DEFAULT NULL,
  `deleted_user` tinyint(1) DEFAULT '0',
  `actions_counter` smallint(6) NOT NULL DEFAULT '0',
  `user_uid` bigint(20) DEFAULT NULL,
  `agenda_uid` bigint(20) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=71390 DEFAULT CHARSET=latin1;

--
-- Contenu de la table `reviewer`
--

INSERT INTO `member` (
  `id`,
  `user_id`,
  `review_id`,
  `credential`,
  `created_at`,
  `updated_at`,
  `store`,
  `organization`,
  `creator_id`,
  `deleted_user`,
  `actions_counter`) VALUES

(
  71385,
  50304,
  218,
  1,
  '2017-10-30 14:21:07',
  '2017-10-30 14:21:07',
  '{"custom_fields":{"organization":"Le Chat Fume","contact_number":"0688996549","contact_name":"Th\\u00e9o Jouanneau","contact_position":"directeur artistique","email":"hello@lechatfume.fr"}}',
  'le-chat-fume',
  NULL,
  0,
  1
);

ALTER TABLE `member` ADD PRIMARY KEY (`id`), ADD KEY `user_id_idx` (`user_id`), ADD KEY `review_id_idx` (`review_id`);

CREATE TABLE IF NOT EXISTS `agenda_event` (
  `id` bigint(20) NOT NULL,
  `agenda_uid` bigint(20) NOT NULL,
  `event_uid` bigint(20) NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `can_edit` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `legacy_id` varchar(30) DEFAULT NULL,
  `user_uid` bigint(20) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=954070 DEFAULT CHARSET=utf8;


CREATE TABLE `event_2` (
  id bigint(20) AUTO_INCREMENT,
  uid BIGINT NOT NULL UNIQUE,
  owner_uid bigint(20),
  creator_uid bigint(20),
  agenda_uid bigint(20),
  location_uid bigint(20),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(2000) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  `references` VARCHAR(2000),
  long_description TEXT,
  keywords VARCHAR(2000),
  conditions VARCHAR(2000),
  image VARCHAR(1500),
  draft TINYINT(1) DEFAULT 1,
  private TINYINT(1) DEFAULT 0,
  timezone VARCHAR(255) NOT NULL,
  timings TEXT,
  accessibility VARCHAR( 100 ),
  age VARCHAR( 50 ),
  registration VARCHAR(2000),
  links VARCHAR(2000),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  file_key varchar(32),
  UNIQUE INDEX id_idx (id),
  UNIQUE INDEX uid_idx (uid),
  UNIQUE INDEX slug_idx (slug),
  INDEX agenda_uid_idx (agenda_uid),
  INDEX location_uid_idx (location_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



create table if not exists `custom` (
  id bigint(20) not null auto_increment,
  form_schema_id bigint(20) not null,
  identifier bigint(20) not null,
  store text not null,
  created_at datetime not null,
  updated_at datetime not null,
  index form_schema_id_idx (form_schema_id),
  index identifier_idx (identifier),
  primary key (id)
) engine=InnoDB default character set utf8 collate utf8_general_ci;



create table if not exists `location` (
  id BIGINT AUTO_INCREMENT,
  uid BIGINT UNIQUE,
  agenda_id bigint,
  slug VARCHAR(100) NOT NULL UNIQUE,
  placename VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(2),
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  owner_id BIGINT NOT NULL,
  main TINYINT(1) DEFAULT '0' NOT NULL,
  store LONGTEXT,
  processed_at datetime,
  region VARCHAR(255),
  department VARCHAR(255),
  city_district VARCHAR(255),
  insee VARCHAR(20),
  postal_code VARCHAR(20),
  eve_id VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE INDEX slug_idx (slug),
  INDEX latlng_idx (latitude, longitude),
  INDEX owner_id_idx (owner_id),
  primary key(id)
) default CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;


CREATE TABLE IF NOT EXISTS `legacy_event` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `image_credits` varchar(255) DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `is_new` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
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


create table if not exists legacy_event_editor (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `event_id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `legacy_event_location` (
  `event_id` bigint(20) NOT NULL DEFAULT '0',
  `location_id` bigint(20) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ticket_link` varchar(255) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `legacy_event_translation` (
  `id` bigint(20) NOT NULL DEFAULT '0',
  `title` varchar(140) NOT NULL,
  `description` varchar(200) NOT NULL,
  `free_text` varchar(10000) DEFAULT NULL,
  `lang` char(2) NOT NULL DEFAULT '',
  `tags` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `legacy_event_location_translation` (
  `id` bigint(20) NOT NULL DEFAULT '0',
  `pricing_info` varchar(255) DEFAULT NULL,
  `lang` char(2) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


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


CREATE TABLE IF NOT EXISTS `legacy_agenda_event` (
  `id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `content` mediumtext,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `store` longtext,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `category_id` bigint(20) DEFAULT NULL,
  `facebook_id` bigint(20) DEFAULT NULL,
  `state` tinyint(4) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=887122 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `legacy_agenda_event_reference` (
  id BIGINT,
  agenda_id BIGINT,
  event_id BIGINT,
  ref_event_id BIGINT,
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;



CREATE TABLE IF NOT EXISTS `legacy_agenda_event_tag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `review_article_id` bigint(20) NOT NULL,
  `review_tag_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `legacy_agenda_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `slug` bigint(20) NOT NULL,
  `category` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `review_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into legacy_agenda_category ( id, slug, category, review_id ) values
  ( 3454, 'animation-loto', 'Animation - Loto', 218 ),
  ( 3455, 'atelier', 'Atelier', 218 ),
  ( 3456, 'ceremonie', 'Cérémonie', 218 ),
  ( 3457, 'cinema-projection', 'Cinéma - Projection', 218 );


CREATE TABLE legacy_agenda_tag (
  id BIGINT AUTO_INCREMENT,
  slug VARCHAR(255) NOT NULL,
  review_id BIGINT NOT NULL,
  tag VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX review_id_idx (review_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into legacy_agenda_tag ( id, slug, review_id, tag ) values
  ( 9661, 'administration', 218, 'Administration' ),
  ( 9662, 'aeronautique', 218, 'Aéronautique' );


--
-- cibul-model repo has table names hardcoded. So event table needs to be aliased for interfaces
-- with old code to work
--
CREATE VIEW event AS SELECT * FROM legacy_event;
CREATE VIEW event_translation AS SELECT * FROM legacy_event_translation;
CREATE VIEW event_location AS SELECT * FROM legacy_event_location;
CREATE VIEW event_location_translation AS SELECT * FROM legacy_event_location_translation;
CREATE VIEW review_article AS SELECT * FROM legacy_agenda_event;
CREATE VIEW occurrence AS SELECT * FROM legacy_occurrence;
CREATE VIEW review AS SELECT * FROM agenda;
CREATE VIEW reviewer AS SELECT * FROM member;
CREATE VIEW review_category as select * from legacy_agenda_category;
CREATE VIEW review_tag as select * from legacy_agenda_tag;

CREATE TABLE review_tag_article (id BIGINT AUTO_INCREMENT, review_article_id BIGINT NOT NULL, review_tag_id BIGINT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX review_article_id_idx (review_article_id), INDEX review_tag_id_idx (review_tag_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
