CREATE TABLE `key` (
  id BIGINT AUTO_INCREMENT,
  type varchar(255) not null,
  identifier bigint(20) not null,
  label varchar(255),
  `key` varchar(255) not null,
  created_at datetime not null,
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
