CREATE TABLE review_tag_article (
  id BIGINT AUTO_INCREMENT,
  review_article_id BIGINT NOT NULL,
  review_tag_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
