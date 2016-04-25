
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;



CREATE TABLE IF NOT EXISTS ${schema} (
  `id` bigint(20) NOT NULL,
  `store` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into ${schema} ( `id`, `store` ) values
(4608, '{"fields": [{"field":"somefield", "type":"text", "params": {"min":2,"max":100}}]}');