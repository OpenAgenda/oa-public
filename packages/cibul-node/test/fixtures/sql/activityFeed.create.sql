create table activity_feed (
  id bigint auto_increment,
  entity_type varchar(255) not null,
  entity_uid bigint not null,
  primary key(id)
) default character set utf8 collate utf8_general_ci engine = innodb;