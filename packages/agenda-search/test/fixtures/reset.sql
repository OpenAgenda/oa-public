drop database if exists ${database};
create database ${database};
use ${database};
CREATE TABLE IF NOT EXISTS ${schema} (
  id BIGINT AUTO_INCREMENT, 
  uid BIGINT UNIQUE, 
  main TINYINT(1) DEFAULT '0' NOT NULL, 
  title VARCHAR(255) NOT NULL, 
  owner_id BIGINT NOT NULL, 
  slug VARCHAR(255) NOT NULL UNIQUE, 
  description VARCHAR(150), 
  image VARCHAR(255), 
  url VARCHAR(255), 
  collaborative TINYINT(1) DEFAULT '0' NOT NULL, 
  contribution_type TINYINT DEFAULT 0 NOT NULL, 
  contribution_info TEXT, 
  store TEXT, 
  created_at DATETIME NOT NULL, 
  updated_at DATETIME NOT NULL, 
  INDEX owner_id_idx (owner_id), 
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;