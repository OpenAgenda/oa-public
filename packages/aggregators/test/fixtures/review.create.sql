create table review (
  id BIGINT NOT NULL,
  uid BIGINT NOT NULL,
  title VARCHAR(255)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
