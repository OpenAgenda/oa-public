CREATE TABLE reviewer (
  id BIGINT,
  user_id BIGINT NOT NULL,
  review_id BIGINT NOT NULL,
  credential BIGINT NOT NULL,
  organization VARCHAR(255),
  store TEXT,
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
