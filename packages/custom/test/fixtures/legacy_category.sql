CREATE TABLE IF NOT EXISTS `legacy_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `legacy_category` ( id, review_id, category, slug ) values
( 123, 15387, 'Une catégorie', 'une-categorie' );