CREATE TABLE access_token (
  id BIGINT AUTO_INCREMENT,
  token VARCHAR(32) UNIQUE,
  lifespan BIGINT NOT NULL,
  api_key_set_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE INDEX id_idx (id),
  UNIQUE INDEX token_idx (token),
  INDEX api_key_set_id_idx (api_key_set_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
