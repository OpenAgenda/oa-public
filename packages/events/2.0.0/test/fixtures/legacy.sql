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

insert into event_location (event_id, location_id, created_at, updated_at) values
  (1, 999, '2018-05-22 13:29:09', '2018-05-22 13:29:09');

create table event_location_translation (
  id bigint,
  pricing_info VARCHAR(255),
  lang CHAR(2),
  primary key(id, lang)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

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

create table location (
  id bigint auto_increment,
  uid bigint unique,
  primary key(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into location (`id`, `uid`) values
  (1, 111),
  (2, 222),
  (3, 46084324),
  (4, 83173065);

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