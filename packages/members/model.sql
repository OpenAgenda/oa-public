create table if not exists `${schema}` (
  id bigint(20) not null auto_increment,
  slug varchar(20),
  user_uid bigint(20),
  user_id bigint(20), # legacy field
  agenda_uid bigint(20),
  review_id bigint(20), # legacy field
  credential bigint(20),
  deleted_user tinyint(1),
  actions_counter smallint(6) default 0, #legacy field
  created_at datetime not null,
  updated_at datetime not null,
  store longtext, # legacy field
  index user_uid_idx (user_uid),
  index agenda_uid_idx (agenda_uid),
  index slug_idx (slug),
  primary key (id)
) engine=InnoDB default character set utf8 collate utf8_general_ci;
