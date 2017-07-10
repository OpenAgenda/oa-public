create table if not exists `${schema}` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `store` longtext,
  unique index id_idx (id),
  primary key(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

