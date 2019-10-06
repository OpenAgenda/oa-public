create table review (
  id BIGINT NOT NULL,
  uid BIGINT NOT NULL
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

insert into review (id, uid) values (218, 999), (219, 998);
