SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `${schema}` (
  `id` bigint(20) NOT NULL,
  `api_key` varchar(32) DEFAULT NULL,
  `api_secret` varchar(32) DEFAULT NULL,
  `type` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `application_id` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `${schema}` (`id`, `api_key`, `api_secret`, `type`, `user_id`, `application_id`, `created_at`, `updated_at`) VALUES
(1, '4bc1106de56674b18e6910699525dfe8', '595e0074271c880b6a69fc59303a310f', 1, 1, NULL, '2012-04-05 15:02:21', '2012-08-27 22:32:21'),
(7, '317e316466a629c8dacd4aa81f39c930', NULL, 1, 2, NULL, '2012-06-06 18:01:38', '2012-06-06 18:01:38'),
(552, '19c1e464984b192228c39d2619d8690c', NULL, 1, 119, NULL, '2015-04-01 06:14:26', '2015-04-01 06:14:26');

ALTER TABLE `api_key_set`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_idx` (`id`),
  ADD UNIQUE KEY `api_key` (`api_key`),
  ADD UNIQUE KEY `api_key_idx` (`api_key`),
  ADD KEY `application_id_idx` (`application_id`),
  ADD KEY `user_id_idx` (`user_id`);

ALTER TABLE `api_key_set`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3060;