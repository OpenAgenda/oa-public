CREATE TABLE IF NOT EXISTS `form_schema` (
  `id` bigint(20) NOT NULL,
  `store` longtext
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

ALTER TABLE `form_schema` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `id_idx` (`id`);
ALTER TABLE `form_schema` MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
