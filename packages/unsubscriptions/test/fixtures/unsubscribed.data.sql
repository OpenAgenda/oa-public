CREATE TABLE IF NOT EXISTS `unsubscribed` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `unsubscribed` (`email`, `created_at`) VALUES
  ('utilisateur1@example.com', '2024-01-08 09:15:00'),
  ('utilisateur2@example.com', '2024-01-08 14:45:00'),
  ('utilisateur3@example.com', '2024-01-08 21:00:00'),
  ('utilisateur4@example.com', '2024-01-08 16:30:00');
