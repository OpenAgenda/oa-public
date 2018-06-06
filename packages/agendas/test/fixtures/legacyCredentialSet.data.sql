CREATE TABLE IF NOT EXISTS ${legacyCredential} (
  id BIGINT AUTO_INCREMENT, 
  owner_id BIGINT NOT NULL, 
  review_id BIGINT, 
  indesign TINYINT(1) DEFAULT '0', 
  activating_invitations TINYINT(1) DEFAULT '0', 
  custom_templates TINYINT(1) DEFAULT '0',
  aggregator TINYINT(1) DEFAULT '0', 
  moderator TINYINT(1) DEFAULT '0',
  custom_head TINYINT(1) DEFAULT '0',
  emailstrategie TINYINT(1) DEFAULT '0',
  tags TINYINT(1) DEFAULT '0', 
  created_at DATETIME NOT NULL, 
  updated_at DATETIME NOT NULL, 
  INDEX review_id_idx (review_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

INSERT INTO ${legacyCredential} 
( `id`, `owner_id`, `review_id`, `indesign`, `aggregator`, `activating_invitations`, `custom_templates`, `moderator`, `custom_head`, `emailstrategie`, `tags`, `created_at`, `updated_at` ) values 
( NULL,     '1',       '4828',       '0',        '0',              '0',                   '0',             '0',          '0',            '0',          '0',      NOW(),        NOW()    ),
( NULL,     '1',       '4837',       '0',        '0',              '0',                   '0',             '0',          '0',            '0',          '0',      NOW(),        NOW()    ),
( NULL,     '1',       '4878',       '0',        '0',              '0',                   '1',             '0',          '0',            '0',          '1',      NOW(),        NOW()    );