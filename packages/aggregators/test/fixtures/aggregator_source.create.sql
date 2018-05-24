CREATE TABLE aggregator_source (
  id BIGINT AUTO_INCREMENT,
  aggregator_id BIGINT NOT NULL,
  review_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX aggregator_id_idx (aggregator_id),
  INDEX review_id_idx (review_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;