CREATE TABLE api_key_set (
  id BIGINT AUTO_INCREMENT,
  api_key VARCHAR(32) UNIQUE,
  api_secret VARCHAR(32),
  type BIGINT NOT NULL,
  user_id BIGINT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE INDEX id_idx (id),
  UNIQUE INDEX api_key_idx (api_key),
  INDEX user_id_idx (user_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
