CREATE TABLE IF NOT EXISTS `legacy_deleted` (
  id BIGINT AUTO_INCREMENT,
  deleted_id BIGINT,
  uid BIGINT,
  type VARCHAR(50) NOT NULL,
  deleted_at datetime NOT NULL,
  store longtext, PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;