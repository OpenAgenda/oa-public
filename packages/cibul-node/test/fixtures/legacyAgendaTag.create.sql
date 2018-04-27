CREATE TABLE legacy_agenda_tag (id BIGINT AUTO_INCREMENT, slug VARCHAR(255) NOT NULL, review_id BIGINT NOT NULL, tag VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX review_id_idx (review_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

CREATE VIEW review_tag AS SELECT * FROM legacy_agenda_tag;