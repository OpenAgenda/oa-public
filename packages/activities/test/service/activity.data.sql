INSERT INTO `${schema}` (`id`, `actor`, `verb`, `object`, `target`, `store`, `created_at`) VALUES
  (1, 'user:54849455', 'event.create', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (2, 'user:99999999', 'event.delete', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (3, 'user:99999950', 'event.action', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (4, 'user:99999951', 'event.delete', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (5, 'user:99999952', 'event.action', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (6, 'user:99999953', 'event.action', 'event:54548513', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (7, 'user:99999954', 'event.delete', 'event:54548512', 'agenda:48648352', '{"labels":{"actor":"Jacky","object":"Réunion des junkies anonymes","target":"la-gargouille"}}', '2017-03-27 14:15:09'),
  (8, 'user:1234', 'event.create', 'event:5678', 'agenda:9012', '{"labels":{"actor": "Kevin", "object": "Va au Starbucks", "target": "le-mercure"}}', '2022-06-08 10:38'),
  (9, 'user:1234', 'event.update', 'event:5678', 'agenda:9012', '{"labels":{"actor": "Kevin", "object": "Boit son jus de chaussettes", "target": "le-mercure"}}', '2022-06-08 10:45'),
  (10, 'user:1234', 'event.create', 'event:4546', 'agenda:3453', '{"labels":{"actor": "Kevin", "object": "Prend le train", "target": "le-train"}}', '2022-06-08 09:20'),
  (11, 'user:789789', 'account.update', 'email', 'user:1234', '{"labels": {"actor": "Rohim", "object": "Email", "target": "Kevin"}}', '2022-06-08 11:30'),
  (12, 'user:789789', 'agenda.sendInvitation', 'email:aogendo@oagenda.com', 'agenda:3453', '{"labels":{"actor":null,"object":"aogendo@oagenda.com","target":"Un agenda contributif"},"credential":1}', '2022-06-08 10:22');
