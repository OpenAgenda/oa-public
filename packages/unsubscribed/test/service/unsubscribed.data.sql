create table if not exists ${schema} (
  id bigint(20) auto_increment,
  user_uid bigint(20) not null,
  type varchar(255),
  subject varchar(40),
  identifier bigint(20),
  created_at datetime not null,
  primary key(id)
) engine=InnoDB auto_increment=1 default charset=utf8;

INSERT INTO `${schema}` (`id`, `user_uid`, `type`, `subject`, `identifier`, `created_at`) VALUES
  (2, 75052324, 'agenda_event_update', 'agenda', 97998826, '2017-03-03 08:47:25'),
  (3, 75052324, 'agenda_event_submit_moderation', 'agenda', 97998826, '2017-03-03 09:24:05'),
  (7, 75052324, 'agenda_event_submit_moderation', 'agenda', 85870128, '2017-03-03 13:22:44'),
  (8, 75052324, 'agenda_event_update', 'agenda', 85870128, '2017-03-03 15:04:17');
