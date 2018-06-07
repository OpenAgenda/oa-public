CREATE TABLE agenda (
  id BIGINT AUTO_INCREMENT, 
  uid BIGINT UNIQUE,
  main TINYINT(1) DEFAULT '0' NOT NULL, 
  official TINYINT(1) DEFAULT '0' NOT NULL,
  officialized_at DATETIME,
  private TINYINT(1) DEFAULT '0' NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id BIGINT NOT NULL,
  form_schema_id BIGINT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(165), /* 150 in real world */
  image VARCHAR(255),
  url VARCHAR(255),
  collaborative TINYINT(1) DEFAULT '0' NOT NULL,
  contribution_type TINYINT DEFAULT 0 NOT NULL,
  contribution_info TEXT,
  store TEXT,
  credentials TEXT,
  settings TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  indexed TINYINT DEFAULT 1,
  INDEX owner_id_idx (owner_id), 
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

CREATE VIEW review AS SELECT * FROM agenda;