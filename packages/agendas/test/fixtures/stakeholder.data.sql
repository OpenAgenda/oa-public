CREATE TABLE IF NOT EXISTS ${stakeholder} (
    `id`              bigint   AUTO_INCREMENT,
    `user_id`         bigint   DEFAULT NULL,
    `review_id`       bigint   NOT NULL,
    `credential`      bigint   NOT NULL,
    `created_at`      datetime,
    `updated_at`      datetime,
    `store`           longtext,
    `organization`    varchar(255) DEFAULT NULL,
    `creator_id`      bigint       DEFAULT NULL,
    `deleted_user`    tinyint(1) DEFAULT '0',
    `actions_counter` int          DEFAULT '0',
    `agenda_uid`      bigint       DEFAULT NULL,
    `user_uid`        bigint       DEFAULT NULL,
    `slug`            varchar(20)  DEFAULT NULL,
    PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE ${stakeholder}
  ADD KEY `user_id_idx` (`user_id`),
  ADD KEY `review_id_idx` (`review_id`),
  ADD KEY `user_uid_idx` (`user_uid`),
  ADD KEY `agenda_uid_idx` (`agenda_uid`),
  ADD KEY `slug_idx` (`slug`);

INSERT INTO ${stakeholder} ( `user_id`, `review_id`, `user_uid`, `agenda_uid`, `slug`, `credential` ) VALUES
(123, 4828, 12345678, 20226356, 'member-one', 2),
(123, 4848, 12345678, 85229066, 'member-two', 1),
(123, 4849, 12345678, 9343334, 'member-two', 1);
