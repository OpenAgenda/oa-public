CREATE TABLE `review` (
  `id` BIGINT NOT NULL,
  `uid` BIGINT NOT NULL,
  `slug` VARCHAR(255),
  `title` VARCHAR(255)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

INSERT INTO `review` (`id`, `uid`, `slug`, `title`) VALUES
(218, 999, NULL, 'Fête de la Science'),
(219, 998, NULL, 'Fête de la Science - La Réunion'),
(2, 222, NULL, 'Fête de la Science - Bretagne'),
(3, 333, 'fds-martinique', 'Fête de la Science - Martinique'),
(4, 444, NULL, 'Fête de la Science - Guadeloupe');
