CREATE TABLE IF NOT EXISTS `agenda` (
  `id` bigint(20) NOT NULL,
  `uid` bigint(20) NOT NULL,
  `form_schema_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `agenda` ( `id`, `uid`, `form_schema_id` ) VALUES
( 1010101, 27434489, 123 ),
( 13866, 56154649, 42 );