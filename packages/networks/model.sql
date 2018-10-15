create table if not exists `${schema}` (
  id bigint(20) not null auto_increment,
  uid bigint(20) unique not null,
  title varchar(255),
  form_schema_id bigint(20),
  created_at datetime not null,
  updated_at datetime not null,
  index id_idx (id),
  index uid_idx (uid),
  primary key (id)
) engine=InnoDB default character set utf8 collate utf8_general_ci;
