CREATE TABLE IF NOT EXISTS ${schema} (
  `id` bigint(20) NOT NULL,
  `store` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into ${schema} ( `id`, `store` ) values
(4609, '{"fields": [{"field":"somefield", "type":"text", "params": {"min":2,"max":100}}]}');