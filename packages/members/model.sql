create table if not exists `${schema}` (
  id bigint(20) not null auto_increment,
  user_uid bigint(20),
  agenda_uid bigint(20),
  credential bigint(20),
  created_at datetime not null,
  updated_at datetime not null,
  index user_uid_idx (user_uid),
  index agenda_uid_idx (agenda_uid),
  primary key (id)
) engine=InnoDB default character set utf8 collate utf8_general_ci;
