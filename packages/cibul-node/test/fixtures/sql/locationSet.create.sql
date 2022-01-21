create table if not exists location_set (
  id bigint(20) not null auto_increment,
  created_at datetime not null,
  updated_at datetime not null,
  uid bigint(20) default null unique,
  title varchar(255) default null,
  settings text default null,
  unique index uid_idx (uid),
  primary key(id)
) engine=InnoDB default character set utf8 collate utf8_general_ci;
