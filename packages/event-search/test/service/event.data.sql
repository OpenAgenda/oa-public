CREATE TABLE `${schema}` (
  id bigint(20) AUTO_INCREMENT,
  uid BIGINT UNIQUE,
  owner_uid bigint(20),
  creator_uid bigint(20),
  agenda_uid bigint(20),
  location_uid bigint(20),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(2000) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  long_description TEXT,
  keywords VARCHAR(2000),
  conditions VARCHAR(2000),
  image VARCHAR(1500),
  draft TINYINT(1) DEFAULT 1,
  private TINYINT(1) DEFAULT 0,
  timezone VARCHAR(255) NOT NULL,
  timings TEXT,
  accessibility VARCHAR( 100 ),
  age VARCHAR( 50 ),
  registration VARCHAR(2000),
  `references` VARCHAR(2000),
  links TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  file_key varchar(32),
  UNIQUE INDEX id_idx (id),
  UNIQUE INDEX uid_idx (uid),
  UNIQUE INDEX slug_idx (slug),
  INDEX agenda_uid_idx (agenda_uid),
  INDEX owner_uid_idx (owner_uid),
  INDEX location_uid_idx (location_uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `${schema}` (
  `id`, `uid`, `owner_uid`, `agenda_uid`, `location_uid`, 
  `slug`, 
  `title`, 
  `description`, 
  `long_description`, 
  `keywords`, 
  `conditions`, 
  `image`, 
  `draft`, 
  `private`, 
  `timezone`, 
  `timings`, 
  `accessibility`, 
  `age`, 
  `registration`, 
  `created_at`, 
  `updated_at`, 
  `deleted_at`
) VALUES 
(
  1, 1, 789678, 7678678, 1,
  'furthest_in_the_future_2',
  '{"fr":"Trié: Dernier"}','{"fr":"Dernier"}','{"fr":"Dernier"}','{"fr":["dernier"],"en":["last"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:20:42', NULL
),
(
  2, 
  2, 
  789679, 
  7678679, 
  1,
  'almost_furthest_in_the_future_1',
  '{"fr":"Trié: Presque le plus dans le futur"}','{"fr":"Presque le plus dans le futur"}','{"fr":"Presque le plus dans le futur"}','{"fr":["futur"],"en":["future"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2035-10-24T12:00:00.000Z","end":"2035-10-24T13:00:00.000Z"},{"begin":"2035-10-24T13:00:00.000Z","end":"2035-10-24T14:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:19:42', NULL
),
(
  3, 
  3, 
  789675, 
  7678675, 
  1,
  'nearest_in_the_future_0',
  '{"fr":"Trié: Le plus proche à venir"}','{"fr":"Le plus proche à venir"}','{"fr":"Le plus proche à venir"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-10-24T12:00:00.000Z","end":"2010-10-24T13:00:00.000Z"},{"begin":"2020-10-24T13:00:00.000Z","end":"2020-10-24T14:30:00.000Z"},{"begin":"2040-10-24T13:00:00.000Z","end":"2040-10-24T14:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),
(
  4, 4, 789670, 7678670, 1,
  'nearest_past_event_3',
  '{"fr":"Trié: Premier-Passe"}','{"fr":"Premier-Passe"}','{"fr":"Premier-Passe"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2017-04-01T12:00:00.000Z","end":"2017-04-01T13:00:00.000Z"},{"begin":"2017-04-01T13:00:00.000Z","end":"2017-04-01T14:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:10:42', NULL
),
(
  5, 5, 789672, 7678672, 1,
  'furthest_past_event_4',
  '{"fr":"Trié: Le plus passé"}','{"fr":"Le plus passé"}','{"fr":"Le plus passé"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T12:00:00.000Z","end":"2010-04-01T13:00:00.000Z"},{"begin":"2010-04-01T13:00:00.000Z","end":"2010-04-01T14:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:16:42', NULL
),
(
  6, 6, 65570947, 21475128, 1, 
  'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
  '{"fr":"Découverte du handball et valorisation du mondial de Handball", "en":"Discovery of handball and valorization of the world competition"}',
  '{"fr":"Animation de proximité sur les city-stade des quartiers prioritaires ou veille de la politique de la ville"}',
  '{"fr":"Date du projet : Du lundi 24 au vendredi 28 octobre\\n\\nHoraires du projet : De 14h00 à 16h30\\n\\nDéroulement du projet : Les quatre premiers jours vont permettre de faire découvrir le handball en initiant les enfants, les adolescents, les adultes aux spécificités de ce sport. Sur le dernier jour, un tournoi ludique pour les 10-17 ans sera organisé.\\n\\nObjectifs du projet :\\n\\nFavoriser la découverte du handball et valoriser l’évènement «   championnat du monde de handball    » Promouvoir le sport comme outil de santé Promouvoir le sport comme outil d’égalité notamment entre le public féminin et masculin\\n\\nLieu :\\n\\nLe lundi 24 octobre : city-stade du quartier Saint-Sauveur Le mardi 25 octobre : city-stade du quartier Saint-Michel Le mercredi 26 octobre : city-stade du quartier du Pont-Féron Le jeudi 27 octobre : gymnase Godard du complexe sportif Saint-Sauveur Le vendredi 28 octobre : gymnase Godard du complexe sportif Saint-Sauveur\\n\\nIntervenants :\\n\\nUn animateur de la Maison d’Activités Saint-Sauveur Un éducateur du club de handball de Flers"}', 
  '{}', 
  NULL, 
  '{"filename":null,"credits":null,"size":{"height":null,"width":null},"variants":[]}',
  0, 
  0, 
  'Europe/Paris', 
  '[{"begin":"2016-10-24T12:00:00.000Z","end":"2016-10-24T13:00:00.000Z"},{"begin":"2016-10-24T13:00:00.000Z","end":"2016-10-24T14:30:00.000Z"},{"begin":"2016-10-25T12:00:00.000Z","end":"2016-10-25T13:00:00.000Z"},{"begin":"2016-10-25T13:00:00.000Z","end":"2016-10-25T14:30:00.000Z"},{"begin":"2016-10-26T12:00:00.000Z","end":"2016-10-26T13:00:00.000Z"},{"begin":"2016-10-26T13:00:00.000Z","end":"2016-10-26T14:30:00.000Z"},{"begin":"2016-10-27T12:00:00.000Z","end":"2016-10-27T13:00:00.000Z"},{"begin":"2016-10-27T13:00:00.000Z","end":"2016-10-27T14:30:00.000Z"},{"begin":"2016-10-28T12:00:00.000Z","end":"2016-10-28T13:00:00.000Z"},{"begin":"2016-10-28T13:00:00.000Z","end":"2016-10-28T14:30:00.000Z"}]', 
  '{"mi":true,"hi":true,"pi":true,"vi":false,"sl":true}', 
  '{"min":8,"max":17}', 
  '[]', 
  '2016-11-04 09:18:42', 
  '2016-11-04 09:18:42', 
  NULL 
),

(
  7, 7, 789111, 7678111, 1,
  'too_early_morning',
  '{"fr":"Horaires: Trop tôt"}','{"fr":"Horaires: Trop tôt"}','{"fr":"Horaires: Trop tôt"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T05:00:00.000Z","end":"2010-04-01T06:00:00.000Z"},{"begin":"2010-04-01T07:00:00.000Z","end":"2010-04-01T07:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),
(
  8, 8, 789112, 7678112, 1,
  'too_late_in_the_evening',
  '{"fr":"Horaires: Trop tard"}','{"fr":"Horaires: Trop tard"}','{"fr":"Horaires: Trop tard"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T23:00:00.000Z","end":"2010-04-01T23:30:00.000Z"},{"begin":"2010-04-01T20:00:00.000Z","end":"2010-04-01T20:30:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),
(
  9, 9, 789113, 7678113, 1,
  'too_early_and_too_late',
  '{"fr":"Horaires: Trop tôt et trop tard"}','{"fr":"Horaires: Trop tôt et trop tard"}','{"fr":"Horaires: Trop tôt et trop tard"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T06:00:00.000Z","end":"2010-04-01T07:00:00.000Z"},{"begin":"2010-04-01T21:00:00.000Z","end":"2010-04-01T21:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),
(
  10, 10, 789114, 7678114, 1,
  'one_timing_fits_within bracket',
  '{"fr":"Horaires: Un horaire colle"}','{"fr":"Horaires: Un horaire colle"}','{"fr":"Horaires: Un horaire colle"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  11, 11, 1, 218, 1,
  'serres-la-claranda-cafe-citoyen',
  '{"fr":"Serres – La Claranda – Café citoyen"}',
  '{"fr":"Des grandes tablées, repas à 19h30 avec un menu unique et une soirée pour partager en musique, en lectures, en dansant, en jouant, en débattant …passionnément !"}',
  '{"fr":"Menu unique, plat + dessert (option « végétarien » à préciser à la réservation). On n\'est pas obligé de dîner pour participer aux Conviviales.\\n« MAUVAISE LANGUE.. !! » une conférence débat de Philippe Blanchet sur le thème de la Glottophobie : la discrimination par la langue.\\n[Détail évènement](http://www.laclaranda.eu/evenement.php?id=348)"}',
  '{}',
  NULL,
  '{}',
  0,
  0,
  'Europe/Paris', 
  '[{"begin":"2016-10-24T12:00:00.000Z","end":"2016-10-24T13:00:00.000Z"},{"begin":"2016-10-24T13:00:00.000Z","end":"2016-10-24T14:30:00.000Z"},{"begin":"2016-10-25T12:00:00.000Z","end":"2016-10-25T13:00:00.000Z"},{"begin":"2016-10-25T13:00:00.000Z","end":"2016-10-25T14:30:00.000Z"},{"begin":"2016-10-26T12:00:00.000Z","end":"2016-10-26T13:00:00.000Z"},{"begin":"2016-10-26T13:00:00.000Z","end":"2016-10-26T14:30:00.000Z"},{"begin":"2016-10-27T12:00:00.000Z","end":"2016-10-27T13:00:00.000Z"},{"begin":"2016-10-27T13:00:00.000Z","end":"2016-10-27T14:30:00.000Z"},{"begin":"2016-10-28T12:00:00.000Z","end":"2016-10-28T13:00:00.000Z"},{"begin":"2016-10-28T13:00:00.000Z","end":"2016-10-28T14:30:00.000Z"}]', 
  '{"mi":true,"hi":true,"pi":true,"vi":false,"sl":true}', 
  '{"min":8,"max":17}', 
  '[]', 
  '2016-11-04 09:28:42', 
  '2016-11-04 09:28:42', 
  NULL 
),

(
  12, 12, 789114, 7678114, 10096987,
  'verdun_bound_box',
  '{"fr":"Kevin fume une clope"}','{"fr":"Kevin fume une clope"}','{"fr":"Kevin fume une clope"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  13, 13, 789115, 7678115, 1,
  'german_event',
  '{"de":"Ich bin ein auslander"}','{"de":"Ich bin ein auslander"}','{"de":"Ich bin ein auslander"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  14, 14, 797897, 796789, 1,
  'keyword_event',
  '{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr" : [ "mot", "clé" ], "en" : [ "key", "word" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  15, 15, 565756, 56567, 1,
  'bracketed_timestamp_1',
  '{"fr":"Timestamp 1"}','{"fr":"Timestamp 1"}','{"fr":"Timestamp 1"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2013-02-19T14:00:00.000Z","end":"2013-02-19T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  16, 16, 678967, 7685678, 1,
  'bracketed_timestamp_2',
  '{"fr":"Timestamp 2"}','{"fr":"Timestamp 2"}','{"fr":"Timestamp 2"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2013-02-02T14:00:00.000Z","end":"2013-02-02T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  17, 17, 43243, 32432, 1,
  'bracketed_timestamp_3',
  '{"fr":"Timestamp 3"}','{"fr":"Timestamp 3"}','{"fr":"Timestamp 3"}','{}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2013-02-10T14:00:00.000Z","end":"2013-02-10T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  18, 18, 797897, 796789, 1,
  'keyword_event_2',
  '{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr" : [ "autre", "clé" ], "en" : [ "other", "keyword" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  19, 19, 797897, 796789, 1,
  'multi_1',
  '{"fr":"Un mississipi"}','{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr" : [ "sleepy", "grumpy" ], "en" : [ "toasty", "psycho" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  20, 20, 797897, 796789, 1,
  'multi_2',
  '{"fr":"Mot clé"}','{"fr":"Deux mississipi"}','{"fr":"Mot clé"}','{"fr" : [ "phone", "teapot" ], "en" : [ "scorbut", "ear" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  21, 21, 797897, 796789, 1,
  'multi_3',
  '{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr":"Mot clé"}','{"fr" : [ "jesus", "blob" ], "en" : [ "freckles", "mississipi chose" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  22, 22, 65570947, 21475128, 8896048, 
  'new_york_event',
  '{"fr":"OtherTimezoneHoraires: un truc à New York", "en":"A thing in New York"}', '{"fr":"un truc à New York", "en":"A thing in New York"}', '{"fr":"un truc à New York", "en":"A thing in New York"}', 
  '{"fr" : [ "lieu" ], "en" : [] }',
  NULL, '{}', 0, 0, 'America/New_York', 
  '[{"begin":"2016-10-24T12:00:00.000Z","end":"2016-10-24T13:00:00.000Z"}]', 
  '{"mi":true,"hi":true,"pi":true,"vi":false,"sl":true}', 
  '{"min":8,"max":17}', 
  '[]', 
  '2016-11-04 09:18:42', 
  '2016-11-04 09:18:42', 
  NULL 
),

(
  23, 23, 797897, 796789, 83357467,
  'quimper_event',
  '{"fr":"Cet événement ne se déroule pas à Paris"}','{"fr":"Cet événement ne se déroule pas à Paris"}','{"fr":"Cet événement ne se déroule pas à Paris"}',
  '{"fr" : [ "prise", "panneau", "lieu" ], "en" : [ "ouest", "poster" ] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  24, 24, 797897, 796789, 78656126,
  'evenement_suisse',
  '{"fr":"Boire à la montagne"}','{"fr":"Boire à la montagne"}','{"fr":"Boire à la montagne"}',
  '{"fr" : [ "lieu" ], "en" : [] }',
  NULL, '{}', 0, 0, 'Europe/Zurich',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"},{"begin":"2010-04-01T22:00:00.000Z","end":"2010-04-01T23:30:00.000Z"}]', 
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  100000, 100000, 789114, 7678114, 65918542,
  'rhone_region_event',
  '{"fr":"Un événement dans une region"}','{"fr":"Un événement dans une region"}','{"fr":"Un événement dans une region"}',
  '{"fr" : [ "lieu" ], "en" : [] }',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2010-04-01T14:00:00.000Z","end":"2010-04-01T18:00:00.000Z"}]',
  '{}',
  '{"min":8,"max":17}',
  '[]',
  '2016-11-04 09:18:42', 
  '2016-11-04 09:18:42',
  NULL
),

(
  30, 30, 789114, 7678678, 1,
  'local_time_1',
  '{"fr":"Un événement à 11h18 à Paris"}','{"fr":"Un événement à 11h18"}','{"fr":"Un événement à 11h18"}','{"fr":["local_time"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2017-09-05T09:18:00.000Z", "end":"2017-09-05T09:30:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

(
  31, 31, 789114, 7678678, 1,
  'local_time_2',
  '{"fr":"Un événement à 13h01 à Paris"}','{"fr":"Un événement à 13h01"}','{"fr":"Un événement à 13h01"}','{"fr":["local_time"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2017-09-05T11:01:00.000Z", "end":"2017-09-05T11:30:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

( 40, 40, 789114, 7678678, 1,
  'date_1',
  '{"fr":"Un événement le 28 février 1981 à Reykjavik"}','{"fr":"Un événement le 28 février 1981 à Reykjavik"}','{"fr":"Un événement le 28 février 1981 à Reykjavik"}', '{"fr":["date_event"]}',
  NULL, '{}', 0, 0, 'Atlantic/Reykjavik',
  '[{"begin":"1981-02-28T03:03:00.000Z", "end":"1981-02-28T03:05:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

( 41, 41, 789114, 7678678, 1,
  'date_2',
  '{"fr":"Un événement le 14 juillet à Paris"}','{"fr":"Un événement le 14 juillet à Paris"}','{"fr":"Un événement le 14 juillet à Paris"}', '{"fr":["date_event"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2017-07-14T11:03:00.000Z", "end":"2017-07-14T11:03:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
),

( 42, 42, 789115, 7678678, 1,
  'apostrophe',
  '{"fr":"C\'est franchement l\'horreur."}','{"fr":"Poltergeist"}','{"fr":"This is a story"}', '{"fr":["apostrophe_event"]}',
  NULL, '{}', 0, 0, 'Europe/Paris',
  '[{"begin":"2017-07-14T11:03:00.000Z", "end":"2017-07-14T11:03:00.000Z"}]',
  '{}', '{"min":8,"max":17}', '[]', '2016-11-04 09:18:42', '2016-11-04 09:18:42', NULL
)
