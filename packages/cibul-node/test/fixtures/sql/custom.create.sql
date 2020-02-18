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