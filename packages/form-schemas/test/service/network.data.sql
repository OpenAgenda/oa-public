create table if not exists `network` (
  `uid` bigint(20) NOT NULL AUTO_INCREMENT,
  `form_schema_id` bigint(20),
  primary key(uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `network` ( `uid`, `form_schema_id` ) values
(1, 1);
