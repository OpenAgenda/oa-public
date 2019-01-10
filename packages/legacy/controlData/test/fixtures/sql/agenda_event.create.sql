CREATE TABLE agenda_event (
  event_uid BIGINT,
  agenda_uid BIGINT,
  state TINYINT(2),
  legacy_id VARCHAR(10)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
