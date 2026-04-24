INSERT INTO `${rule}` (`entity_name`, `identifier`, `actions`, `subject`, `inverted`, `conditions`, `fields`, `reason`) VALUES
  ('user',   99999999, 'receive', 'eventUpdate', 0, NULL, NULL, NULL),
  ('member', 60815,    'receive', 'eventUpdate', 1, NULL, NULL, NULL),
  ('member', 60815,    'receive', 'mail',        0, '{"verb":"agenda.eventPublished"}', NULL, NULL),
  ('agenda', 48959239, 'receive', 'mail',        1, '{"verb":"agenda.eventPublished"}', NULL, NULL),
  ('member', 60815,    'receive', 'activity',    1, '{"verb":"agenda.eventChangeState"}', NULL, NULL),
  ('member', 60815,    'receive', 'activity',    1, '{"verb":"spam"}', NULL, NULL),
  ('member', 60818,    'receive', 'activity',    1, NULL, NULL, NULL),
  ('member', 60818,    'receive', 'activity',    0, '{"verb":"agenda.eventChangeState"}', NULL, NULL);
