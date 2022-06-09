create table activity (
  id bigint auto_increment,
  actor varchar(255) not null,
  verb varchar(255) not null,
  object varchar(255) default null,
  target varchar(255) default null,
  store longtext default null,
  created_at datetime not null,
  updated_at datetime not null,
  primary key(id)
) default character set utf8 collate utf8_general_ci engine = innodb;