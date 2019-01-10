CREATE TABLE IF NOT EXISTS `review_tag_article` (
  `id` bigint(20) NOT NULL,
  `review_article_id` bigint(20) NOT NULL,
  `review_tag_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
