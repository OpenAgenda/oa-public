create table if not exists `${schema}` (
  id bigint(20) not null auto_increment,
  agenda_uid bigint(20) not null,
  event_uid bigint(20) not null,
  state tinyint(1) not null default 0,
  featured tinyint(1) not null default 0,
  created_at datetime not null,
  updated_at datetime not null,
  primary key ( id )
) engine=InnoDB  default character set utf8 collate utf8_general_ci;