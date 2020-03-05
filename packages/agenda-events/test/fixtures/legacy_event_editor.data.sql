CREATE TABLE `event_editor` (
  event_id BIGINT NOT NULL,
  review_id BIGINT,
  type TINYINT
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

INSERT INTO `event_editor` ( review_id, event_id ) VALUES
( 4608, 81824 );
