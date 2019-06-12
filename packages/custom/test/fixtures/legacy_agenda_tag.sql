CREATE TABLE IF NOT EXISTS `legacy_agenda_tag` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tag` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into `legacy_agenda_tag` ( id, review_id, tag, slug ) values
( 43082, 15387, 'Entreprise privée ou publique', 'entreprise-privee-ou-publique' ),
( 27690, 13866, 'Sciences numériques', 'sciences-numeriques' ),
( 27696, 13866, 'Lycée (15 - 16 ans)', 'lycee-15-16-ans' ),
( 27697, 13866, 'Etudiants (18 - 25 ans)', 'etudiants-18-25-ans' ),
( 9663, 1010101, 'Agroalimentaire', 'agroalimentaire' ),
( 9664, 1010101, 'Archéologie préventive', 'archeologie-preventive' ),
( 9665, 1010101, 'Une valeur', 'une-valeur' );
