create table event (
  id bigint auto_increment,
  uid bigint unique,
  slug VARCHAR(255) not null unique,
  image_credits VARCHAR(255),
  url VARCHAR(255),
  image VARCHAR(255),
  background_image VARCHAR(255),
  background_color VARCHAR(7),
  age_min SMALLINT,
  age_max SMALLINT,
  accessibility VARCHAR(255),
  type VARCHAR(2),
  owner_id bigint,
  is_published TINYINT(1) DEFAULT '0' not null,
  is_new TINYINT(1) DEFAULT '1' not null,
  file_key VARCHAR(32),
  store TEXT,
  custom_fields TEXT,
  eve_id VARCHAR(100) unique,
  origin_uid bigint,
  created_at datetime not null,
  updated_at datetime not null,
  unique INDEX id_idx (id),
  unique INDEX uid_idx (uid),
  unique INDEX slug_idx (slug),
  INDEX owner_id_idx (owner_id),
  primary key(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into event (id, uid, slug, created_at, updated_at) values
  (1, 19853966, 'ventes-de-velos-d-occasion', '2018-05-22 13:29:09', '2018-05-22 13:29:10');

insert into event (`id`, `slug`, `url`, `image`, `background_image`, `background_color`, `owner_id`, `is_published`, `is_new`, `created_at`, `updated_at`, `uid`, `store`, `eve_id`, `custom_fields`, `age_min`, `age_max`, `accessibility`, `type`, `origin_uid`, `file_key`, `image_credits` ) VALUES
(147621,
  'indoor-de-paris-cso-pro-1',
  NULL,
  'event_indoor-de-paris-cso-pro-1_563851.jpg',
  NULL,
  NULL,
  27645,
  1,
  0,
  '2016-10-14 15:01:00',
  '2016-10-14 15:01:01',
  27434489,
  '{"links":[{"link":"http://vimeo.com/24043834","code":"<div style=\\"left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.6669%;\\"><iframe src=\\"https://player.vimeo.com/video/24043834?byline=0&amp;badge=0&amp;portrait=0&amp;title=0\\" style=\\"border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;\\" allowfullscreen scrolling=\\"no\\"></iframe></div>"}]}',
  NULL, NULL, NULL, NULL, '["mi","hi","sl"]', NULL, 48959239, 'reai4iufo57yuqo3fdy6qqoi5fy3iqo', '@gaetan 2017' );


create table event_translation (
  id bigint,
  title VARCHAR(140) not null,
  description VARCHAR(200) not null,
  free_text TEXT,
  tags VARCHAR(255),
  lang CHAR(2),
  primary key(id,
  lang)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into `event_translation` (`id`, `title`, `description`, `free_text`, `lang`, `tags`) values (147621, 'Indoor de Paris - CSO Pro 1 ', 'Epreuve de Saut d''Obstacles Pro 1 ', 'Lors de cette épreuve **50 couples de cavaliers professionnel **prendront le départ de deux parcours d''obstacles de 1m40 et 1m45.\n\nL''objectif pour les concurrents est d''effectuer deux parcours sans faute et le plus rapidement possible.\n\nVous ne connaissez pas la compétition de saut d''obstacles? Pas de panique le règlement est simple, vous vous prendrez au jeu facilement !\n\nVous pourrez apprécier **la franchise, la puissance, l''adresse, la rapidité **et le respect du cheval ainsi que la qualité d''équitation du cavalier.\n\nLa compétition se déroulera en deux manches:\n\n*   **Etape 1** :\n\nBarème A au chrono sans barrage\n\nHauteur : 1,40 m\n\n50 partants\n\nLundi 28/11: 14h30 - 16h30\n\n*   **Etape 2** : Finale\n\nSuper 10, option B\n\nHauteur : 1,45 m\n\n50 partants\n\nMardi 29/11: 10h00 - 12h00\n\n**Secteur**\n\nHall 5a - Carrière Fédérale', 'fr', 'CSO, epreuves, indoor de paris, pro');


create table event_location (
  id bigint auto_increment,
  event_id bigint,
  location_id bigint,
  ticket_link VARCHAR(255),
  created_at datetime not null,
  updated_at datetime not null,
  INDEX event_id_idx (event_id),
  INDEX location_id_idx (location_id),
  primary key(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into `event_location` (event_id, location_id, created_at, updated_at) values
  (1, 999, '2018-05-22 13:29:09', '2018-05-22 13:29:09');
insert into `event_location` (`event_id`, `location_id`, `created_at`, `updated_at`, `ticket_link`, `id`) VALUES
  (147621, 208308, '2016-10-14 15:01:00', '2016-10-14 15:01:00', 'email@website.com, 0123456789', 160178);

create table event_location_translation (
  id bigint,
  pricing_info VARCHAR(255),
  lang CHAR(2),
  primary key(id, lang)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into `event_location_translation` (`id`, `pricing_info`, `lang`) values
  (160178, 'Entrée pas chère', 'fr'),
  (160178, 'Cheap entrance', 'en');

create table occurrence (
  id bigint auto_increment,
  event_id bigint not null,
  location_id bigint not null,
  date DATE not null,
  time_start TIME not null,
  time_end TIME,
  created_at datetime not null,
  updated_at datetime not null,
  unique INDEX id_idx (id),
  INDEX event_id_idx (event_id),
  INDEX location_id_idx (location_id),
  primary key(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into `occurrence` (`id`, `event_id`, `location_id`, `date`, `time_start`, `time_end`, `created_at`, `updated_at`) values
  (1037192, 147621, 208308, '2016-11-29', '10:00:00', '12:00:00', '2016-10-14 15:01:00', '2016-10-14 15:01:00'),
  (1037191, 147621, 208308, '2016-11-28', '12:00:00', '14:00:00', '2016-10-14 15:01:00', '2016-10-14 15:01:00');

create table location (
  id bigint auto_increment,
  uid bigint unique,
  timezone varchar(30),
  primary key(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into location (`id`, `uid`, `timezone`) values
  (1, 111, 'Europe/Paris'),
  (2, 222, 'Europe/Paris'),
  (3, 46084324, 'Europe/Paris'),
  (4, 83173065, 'Europe/Paris'),
  (208308, 123456, 'Europe/Paris');

create table review (
  id bigint auto_increment,
  uid bigint unique,
  primary key(id)
);

insert into review (`id`, `uid`) values
  (1, 111),
  (2, 222);

create table deleted (
  id bigint auto_increment,
  uid bigint(20),
  type varchar(50),
  deleted_at datetime default null,
  store longtext default null,
  deleted_id bigint(20) default null,
  primary key(id)
);

create table `agenda_event_reference` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `agenda_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `ref_event_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=887122 DEFAULT CHARSET=utf8;

insert into `agenda_event_reference` (`id`, `agenda_id`, `event_id`, `ref_event_id` ) values
(1, 7081, 147621, 145552 ),
(2, 7081, 147621, 147620 );
