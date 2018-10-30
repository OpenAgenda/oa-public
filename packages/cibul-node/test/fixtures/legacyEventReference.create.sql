CREATE TABLE IF NOT EXISTS `legacy_agenda_event_reference` (
  id BIGINT, 
  agenda_id BIGINT, 
  event_id BIGINT, 
  ref_event_id BIGINT, 
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
