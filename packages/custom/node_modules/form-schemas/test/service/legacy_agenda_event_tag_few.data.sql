CREATE TABLE IF NOT EXISTS `${schema}` (
  `id` bigint(20) NOT NULL,
  `review_article_id` bigint(20) NOT NULL,
  `review_tag_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `${schema}`
--

INSERT INTO `${schema}` (`review_article_id`, `review_tag_id`) VALUES
(432924, 3115),
(432924, 3116);