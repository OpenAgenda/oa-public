CREATE TABLE `inboxes_inbox` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `identifier` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inboxes_inbox_type_identifier_index` (`type`,`identifier`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_inbox_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `inbox_id` bigint unsigned NOT NULL,
  `user_uid` bigint unsigned NOT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inboxes_inbox_user_inbox_id_index` (`inbox_id`),
  KEY `inboxes_inbox_user_user_uid_index` (`user_uid`),
  CONSTRAINT `inboxes_inbox_user_inbox_id_foreign` FOREIGN KEY (`inbox_id`) REFERENCES `inboxes_inbox` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_conversation` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `type_identifier` varchar(100) DEFAULT NULL,
  `store` longtext,
  `creator_inbox_user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `file_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inboxes_conversation_file_key_unique` (`file_key`),
  KEY `inboxes_conversation_type_identifier_index` (`type_identifier`),
  KEY `inboxes_conversation_creator_inbox_user_id_index` (`creator_inbox_user_id`),
  CONSTRAINT `inboxes_conversation_creator_inbox_user_id_foreign` FOREIGN KEY (`creator_inbox_user_id`) REFERENCES `inboxes_inbox_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_inbox_conversation` (
  `inbox_id` bigint unsigned NOT NULL,
  `conversation_id` bigint unsigned NOT NULL,
  KEY `inboxes_inbox_conversation_inbox_id_index` (`inbox_id`),
  KEY `inboxes_inbox_conversation_conversation_id_index` (`conversation_id`),
  CONSTRAINT `inboxes_inbox_conversation_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `inboxes_conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inboxes_inbox_conversation_inbox_id_foreign` FOREIGN KEY (`inbox_id`) REFERENCES `inboxes_inbox` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_message` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `inbox_user_id` bigint unsigned NOT NULL,
  `body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inboxes_message_conversation_id_index` (`conversation_id`),
  KEY `inboxes_message_inbox_user_id_index` (`inbox_user_id`),
  CONSTRAINT `inboxes_message_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `inboxes_conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inboxes_message_inbox_user_id_foreign` FOREIGN KEY (`inbox_user_id`) REFERENCES `inboxes_inbox_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_message_attachment` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `inbox_user_id` bigint unsigned NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inboxes_message_attachment_message_id_index` (`message_id`),
  KEY `inboxes_message_attachment_inbox_user_id_index` (`inbox_user_id`),
  CONSTRAINT `inboxes_message_attachment_inbox_user_id_foreign` FOREIGN KEY (`inbox_user_id`) REFERENCES `inboxes_inbox_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inboxes_message_attachment_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `inboxes_message` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `inboxes_email_message_ids` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint DEFAULT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inboxes_email_message_ids_conversation_id_index` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `inboxes_email_reply_tos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint DEFAULT NULL,
  `user_uid` bigint DEFAULT NULL,
  `reply_to` varchar(255) DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inboxes_email_reply_tos_conversation_id_index` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;