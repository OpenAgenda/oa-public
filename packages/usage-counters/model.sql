create table if not exists usage_counter (
  id bigint(20) not null auto_increment,
  actor_namespace varchar(20) default null,
  actor_identifier bigint(20),
  target_namespace varchar(20) default null,
  begin datetime not null,
  end datetime not null,
  store longtext,
  primary key (id)
) engine=InnoDB default character set utf8mb4 collate utf8mb4_0900_ai_ci;