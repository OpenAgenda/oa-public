drop database if exists ${database};
create database ${database};
use ${database};
CREATE TABLE IF NOT EXISTS ${agendaSchema} (
  id BIGINT AUTO_INCREMENT,
  uid BIGINT UNIQUE,
  official TINYINT(1) DEFAULT '0' NOT NULL,
  private TINYINT(1) DEFAULT '0' NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id BIGINT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(165), /* 150 in real world */
  image VARCHAR(255),
  url VARCHAR(255),
  credentials TEXT,
  settings TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX owner_id_idx (owner_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

CREATE TABLE IF NOT EXISTS ${agendaEventSchema} (
  id BIGINT AUTO_INCREMENT,
  review_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  state TINYINT,
  is_published TINYINT(1) DEFAULT '0' NOT NULL,
  INDEX review_id_idx (review_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
