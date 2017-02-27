create table if not exists ${schema} (
  id bigint(20) auto_increment,
  user_uid bigint(20) not null,
  type varchar(255),
  subject varchar(40),
  identifier bigint(20),
  created_at datetime not null,
  primary key(id)
) engine=InnoDB auto_increment=1 default charset=utf8;