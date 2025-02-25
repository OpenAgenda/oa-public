CREATE TABLE IF NOT EXISTS ${occurrence} (
  id BIGINT AUTO_INCREMENT, 
  event_id BIGINT NOT NULL, 
  date DATE NOT NULL, 
  UNIQUE INDEX id_idx (id), 
  INDEX event_id_idx (event_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

INSERT INTO ${occurrence} ( `event_id`, `date` ) VALUES
( 1000, '2031-04-13' ),
( 1001, '2031-04-13' ),
( 1002, '2031-04-13' ),
( 1003, '2031-04-13' ),
( 1004, '2031-04-13' ),
( 1005, '2031-04-13' ),
( 1006, '2031-04-13' ),
( 1007, '2011-04-13' ),
( 1008, '2011-04-13' ),
( 1000, '2011-04-13' ),
( 1001, '2011-04-13' ),
( 1002, '2011-04-13' ),
( 1003, '2011-04-13' ),
( 1004, '2011-04-13' ),
( 1005, '2011-04-13' ),
( 1006, '2011-04-13' )