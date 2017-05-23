CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL,
  `review_id` bigint(20) NOT NULL,
  `event_id` bigint(20) NOT NULL,
  `category_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `${schema}`
--

INSERT INTO `${schema}` (`id`, `review_id`, `event_id`, `category_id`) VALUES
(432924, 3868, 80445, 630),

-- for testing multichoice transfer
(1058980, 7292, 152412, NULL ),

-- for testing checkbox transfer
(1020011, 7796, 166062, NULL),
(1020012, 7796, 186834, NULL);