create table if not exists `${schema}` (
  `uid` bigint(20) NOT NULL AUTO_INCREMENT,
  `form_schema_id` bigint(20),
  primary key(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `${schema}` ( `uid`, `form_schema_id` ) values
(1, 1);
