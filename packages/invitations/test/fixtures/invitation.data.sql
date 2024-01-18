CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `store` longtext,
  `processedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `invitation` (`id`, `email`, `token`, `store`, `processedAt`) VALUES
  (1, 'kevin.bertho@gmail.com', '066LREi0S3hUA2Uh273a6b147C15rMV2', '{"nextId":3,"actions":[{"id":1,"name":"createStakeholder","params":{"role":"admin"}},{"id":2,"name":"uneActionBidon","params":["firstParams",{"second":"caca"}]}]}', NULL);
