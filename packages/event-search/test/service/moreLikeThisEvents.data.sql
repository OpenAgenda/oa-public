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
  56, #id
  57, #uid
  789678, #owner_uid
  7678678, #agenda_uid
  1, #location_uid
  'shop_event', #slug
  '{"fr":"Première soirée à la boutique"}', #title
  '{"fr":"description"}', #description
  '{"fr":"lDescription"}', #long description
  '{"fr":["vin chaud"],"en":["hot wine"]}', #keywords
  NULL, #conditions
  '{}', #image
  0, #draft
  0, #private
  'Europe/Paris', #timezone
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', #timings
  '{}', #accessibility
  '{"min":8,"max":17}', #age
  '[]', #registration
  '2016-11-04 09:18:42', #created_at
  '2016-11-04 09:20:42', #updated_at
  NULL #deleted_at
),

(
  81, #id
  82, #uid
  789678, #owner_uid
  7678678, #agenda_uid
  1, #location_uid
  'shop_event_2', #slug
  '{"fr":"Première soirée à la boutique"}', #title
  '{"fr":"description"}', #description
  '{"fr":"lDescription"}', #long description
  '{"fr":["vin chaud", "bières", "janine"],"en":["hot wine"]}', #keywords
  NULL, #conditions
  '{}', #image
  0, #draft
  0, #private
  'Europe/Paris', #timezone
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', #timings
  '{}', #accessibility
  '{"min":8,"max":17}', #age
  '[]', #registration
  '2016-11-04 09:18:42', #created_at
  '2016-11-04 09:20:42', #updated_at
  NULL #deleted_at
),

(
  106, #id // UNIQUE
  107, #uid // UNIQUE
  789678, #owner_uid
  7678678, #agenda_uid
  1, #location_uid
  'masdar_event_1', #slug // UNIQUE
  '{"fr":"Tri de bazar"}', #title
  '{"fr":"Bazar sorting"}', #description
  '{"fr":""}', #long description
  '{"fr":[],"en":[]}', #keywords
  NULL, #conditions
  '{}', #image
  0, #draft
  0, #private
  'Europe/Paris', #timezone
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', #timings
  '{}', #accessibility
  '{"min":8,"max":17}', #age
  '[]', #registration
  '2016-11-04 09:18:42', #created_at
  '2016-11-04 09:20:42', #updated_at
  NULL #deleted_at
),

(
  131, #id // UNIQUE
  132, #uid // UNIQUE
  789678, #owner_uid
  7678678, #agenda_uid
  1, #location_uid
  'finger_event_1', #slug // UNIQUE
  '{"fr":"Les doigts dans le nez"}', #title
  '{"fr":""}', #description
  '{"fr":""}', #long description
  '{"fr":[],"en":[]}', #keywords
  NULL, #conditions
  '{}', #image
  0, #draft
  0, #private
  'Europe/Paris', #timezone
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', #timings
  '{}', #accessibility
  '{"min":8,"max":17}', #age
  '[]', #registration
  '2016-11-04 09:18:42', #created_at
  '2016-11-04 09:20:42', #updated_at
  NULL #deleted_at
),

(
  156, #id // UNIQUE
  157, #uid // UNIQUE
  789678, #owner_uid
  7678678, #agenda_uid
  83357467, #location_uid 
  'finger_event_2', #slug // UNIQUE
  '{"fr":"Ou ailleurs"}', #title
  '{"fr":""}', #description
  '{"fr":""}', #long description
  '{"fr":[ "doigts", "nez", "ailleurs" ],"en":[]}', #keywords
  NULL, #conditions
  '{}', #image
  0, #draft
  0, #private
  'Europe/Paris', #timezone
  '[{"begin":"2036-10-24T12:00:00.000Z","end":"2036-10-24T13:00:00.000Z"},{"begin":"2036-10-24T13:00:00.000Z","end":"2036-10-24T14:30:00.000Z"}]', #timings
  '{}', #accessibility
  '{"min":8,"max":17}', #age
  '[]', #registration
  '2016-11-04 09:18:42', #created_at
  '2016-11-04 09:20:42', #updated_at
  NULL #deleted_at
)
