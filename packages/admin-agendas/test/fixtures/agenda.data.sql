

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

-- --------------------------------------------------------

--
-- Table structure for table ${schema}
--

CREATE TABLE IF NOT EXISTS ${schema} (
`id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` mediumtext,
  `image` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `collaborative` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `uid` bigint(20) DEFAULT NULL,
  `main` tinyint(1) NOT NULL DEFAULT '0',
  `store` longtext,
  `contribution_type` tinyint(4) NOT NULL DEFAULT '0',
  `contribution_info` text,
  `official` tinyint(1) NOT NULL DEFAULT '0',
  `settings` text,
  `credentials` text
) ENGINE=InnoDB AUTO_INCREMENT=5396 DEFAULT CHARSET=utf8;

--
-- Dumping data for table ${schema}
--

INSERT INTO ${schema} (`id`, `title`, `owner_id`, `slug`, `description`, `image`, `url`, `collaborative`, `created_at`, `updated_at`, `uid`, `main`, `store`, `contribution_type`, `contribution_info`) VALUES
(4608, 'Rendez-vous aux Jardins 2016 [Officiel]', 2, 'rdj2016', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2016-03-21 18:42:03', 62792452, 0, '{\r\n  "eventFreeText": {\r\n    "fr": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)",\r\n    "en": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"\r\n  },\r\n  "keys": [\r\n    {\r\n      "hash": "856f1b3a6a8e9e4c5b035dc106bd6c99"\r\n    }\r\n  ],\r\n  "order": "relative",\r\n  "form": {\r\n    "fields": [\r\n      {\r\n        "name": "longDescription",\r\n        "placeholder": {\r\n          "fr": "Description détaillée de l''événement, crédit photo: nom du photographe ",\r\n          "en": "Detailed desecription of the event, photo credits: name of the photograph"\r\n        }\r\n      },\r\n      {\r\n        "name": "image",\r\n        "info": {\r\n          "fr": "Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.",\r\n          "en": "Only upload images for which you have a valid license"\r\n        }\r\n      },\r\n      {\r\n        "name": "timings",\r\n        "activeDays": [\r\n          {\r\n            "startDate": "2016-06-03",\r\n            "endDate": "2016-06-05"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        "name": "keywords",\r\n        "display": false\r\n      },\r\n      {\r\n        "name": "conditions",\r\n        "label": {\r\n          "fr": "Détail des conditions",\r\n          "en": "Condition details"\r\n        },\r\n        "placeholder": {\r\n          "fr": "Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.",\r\n          "en": "Pricing, availability, minimum number of participants for a group visit, etc."\r\n        }\r\n      }\r\n    ]\r\n  },\r\n  "moderated": true,\r\n  "send_invitation_email": true,\r\n  "contributorconfigstep": -1,\r\n  "chatbox": true,\r\n  "moderators": {\r\n    "canPublish": false\r\n  },\r\n  "cFields": {\r\n    "organization": [],\r\n    "contact_number": [],\r\n    "contact_name": [],\r\n    "contact_position": []\r\n  },\r\n  "dataviz": "[]"\r\n}', 2, 'Un guide d''aide à la saisie est disponible à cette adresse : http://rendezvousauxjardins.culturecommunication.gouv.fr/Guide-d-aide-a-la-saisie\r\n\r\nNous comptons sur votre pleine mobilisation pour que cet agenda soit le plus complet et attractif possible et qu''il donne goût aux internautes de découvrir les belles initiatives que vous portez partout en France à l''occasion de cette manifestation.\r\n\r\nBonne contribution !\r\n\r\nLe Ministère de la Culture et de la Communication'),
(4609, 'Rendez-vous aux Jardins 2016 [Bis]', 2, 'rdj2016b', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2016-03-21 18:42:03', 6272452, 0, '{\r\n  "eventFreeText": {\r\n    "fr": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)",\r\n    "en": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"\r\n  },\r\n  "keys": [\r\n    {\r\n      "hash": "856f1b3a6a8e9e4c5b035dc106bd6c99"\r\n    }\r\n  ],\r\n  "order": "relative",\r\n  "form": {\r\n    "fields": [\r\n      {\r\n        "name": "longDescription",\r\n        "placeholder": {\r\n          "fr": "Description détaillée de l''événement, crédit photo: nom du photographe ",\r\n          "en": "Detailed desecription of the event, photo credits: name of the photograph"\r\n        }\r\n      },\r\n      {\r\n        "name": "image",\r\n        "info": {\r\n          "fr": "Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.",\r\n          "en": "Only upload images for which you have a valid license"\r\n        }\r\n      },\r\n      {\r\n        "name": "timings",\r\n        "activeDays": [\r\n          {\r\n            "startDate": "2016-06-03",\r\n            "endDate": "2016-06-05"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        "name": "keywords",\r\n        "display": false\r\n      },\r\n      {\r\n        "name": "conditions",\r\n        "label": {\r\n          "fr": "Détail des conditions",\r\n          "en": "Condition details"\r\n        },\r\n        "placeholder": {\r\n          "fr": "Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.",\r\n          "en": "Pricing, availability, minimum number of participants for a group visit, etc."\r\n        }\r\n      }\r\n    ]\r\n  },\r\n  "moderated": true,\r\n  "send_invitation_email": true,\r\n  "contributorconfigstep": -1,\r\n  "chatbox": true,\r\n  "moderators": {\r\n    "canPublish": false\r\n  },\r\n  "cFields": {\r\n    "organization": [],\r\n  "contact_name": [],\r\n    "contact_position": []\r\n  },\r\n  "dataviz": "[]"\r\n}', 2, 'Un guide d''aide à la saisie est disponible à cette adresse : http://rendezvousauxjardins.culturecommunication.gouv.fr/Guide-d-aide-a-la-saisie\r\n\r\nNous comptons sur votre pleine mobilisation pour que cet agenda soit le plus complet et attractif possible et qu''il donne goût aux internautes de découvrir les belles initiatives que vous portez partout en France à l''occasion de cette manifestation.\r\n\r\nBonne contribution !\r\n\r\nLe Ministère de la Culture et de la Communication'),
(27, 'SOS RACISME de DIEPPE', 68, 'sos-racisme-de-dieppe', 'La discrimination n\'est pas une fatalité. C\'est ensemble que nous pouvons la combattre.\r\nTéléphone : 06 11 84 18 86\r\nEmail : sosracisme76@gmail.com', 'review_sos-racisme-de-dieppe_00.jpg', '', 0, '2011-06-08 22:26:48', '2012-11-18 19:34:54', 13873931, 1, NULL, 0, NULL),
(29, 'Futur en Seine 2011', 1, 'futur-en-seine-2011', 'Futur en Seine s’articule autour d’un Cycle de Conférences Internationales liées au  Futur de la Vie, de la Création, des Communications et de la Ville.', 'review_futur-en-seine-2011_01.jpg', '', 0, '2011-06-09 14:12:43', '2012-05-29 16:07:40', 84653177, 0, NULL, 0, NULL),
(30, 'Cibul', 2, 'cibul', 'Les événements où vous pourrez nous rencontrer', 'review_cibul_02.jpg', 'http://cibul.net', 1, '2011-06-10 07:57:15', '2016-03-31 14:30:06', 83128747, 0, '{"order":"relative","fb":{"token":"CAADGUgYTo9EBAGn8ZAXZArQTyP5ULEq7ZB1DpHDhKqnBqhlB3enns8nIt3OJJRCqffjjwkZC5HaNAbrZAq5NrzliUBXVCVSgx3GV0vYqf5V9L5JFxXdi5jZCiW7iDrakrCG0xx5cZAleyTQ57O510CHAgdkPRgXHy5VCV0Ut8R2fji5yKDFaMZA4ZAzPaJ8r80XoZD","error":false,"page":"Cibul","pageId":"106613960419","post":false,"cover":true,"auto":false},"theme":{"repeat":"norepeat","anchorage":"center","canvasposition":"center","bgcolor":false,"offset":60,"image":"review-bg-1389094696-330.jpg","suffix":8914},"moderated":false,"draft":false,"send_invitation_email":true,"contributorconfigstep":-1,"cFields":[]}', 1, NULL),
(33, 'eka3', 74, 'eka3', 'Various artists and bands are today socially and artistically engaged in creating a new Arabic musical identity.\r\n\r\neka3 is a pan-Arab organization strategically dedicated to creating, promoting and growing this new emerging wave by pointing it out to the world, and filling in the missing links between this scene & the Arab public. \r\n\r\nhttp://www.eka3.org/\r\nhttp://www.youtube.com/eka3music	\r\ncontact@eka3.org', 'review_eka3_00.jpg', '', 0, '2011-06-10 13:48:05', '2011-06-10 14:29:35', 47940869, 0, NULL, 0, NULL),
(34, 'Paris Jazz Festival', 1, 'paris-jazz-festival', 'Le Parc Floral propose une programmation harmonisée dans ses couleurs et ses ambitions des beaux jours de juin à ceux de septembre.', 'review_paris-jazz-festival_00.jpg', '', 0, '2011-06-10 14:49:18', '2011-06-10 14:49:18', 58243859, 0, NULL, 0, NULL),
(36, 'Festival Days Off', 1, 'festival-days-off', '2eme Edition a la Cité de la Musique', 'review_festival-days-off_00.jpg', '', 0, '2011-06-13 17:08:54', '2011-06-13 17:08:54', 52281342, 0, NULL, 0, NULL),
(37, 'Festival d\'Automne à Paris', 1, 'festival-d-automne-paris', 'Plus de soixante propositions composent cette année l’alchimie énigmatique des spectacles qui diront l’Automne...', 'review_festival-d-automne-paris_00.jpg', '', 0, '2011-06-14 14:42:44', '2011-06-14 14:42:44', 50439958, 0, NULL, 0, NULL),
(40, 'CHE BALADIN ED FALAIZchansons à boire ,à manger et à trier', 45, 'che-baladin-ed-falaizchansons-boire-manger-et-trier', 'quartet electro acoustique \r\ncabaret de rue \r\nambiance festive\r\n chansons à textes\r\n   scene\r\n\r\naccordéon,ukulélé,contrebasse,guitare,theremin,lap top\r\n', 'review_che-baladin-ed-falaizchansons-boire-manger-et-trier_00.jpg', '', 0, '2011-06-22 14:37:40', '2011-07-23 09:51:55', 26843715, 0, NULL, 0, NULL),
(41, 'On n\'arrête pas le théâtre', 103, 'on-n-arr-te-pas-le-th-tre', 'Du 5 au 24 juillet venez découvrir, la 5e édition du festival de la compagnie estrarre !\r\n\r\nInformations et renseignements sur www.etoiledunord-theatre.com\r\n', 'review_on-n-arr-te-pas-le-th-tre_00.jpg', '', 0, '2011-06-27 15:15:54', '2011-06-27 15:18:00', 78851080, 0, NULL, 0, NULL),
(42, 'Culture En Brousse', 104, 'culture-en-brousse', 'Plate-forme associative de développement artistique et culturel de la région dieppoise et haut-normande.', 'review_culture-en-brousse_02.jpg', '', 0, '2011-06-28 12:46:26', '2012-11-18 19:35:14', 10663985, 1, NULL, 0, NULL),
(43, 'Programmation de la Station Spatiale', 127, 'programmation-de-la-station-spatiale', 'retrouvez ici nos évènements, pour plus d\'infos retrouvez notre page FB : http://www.facebook.com/pages/La-Station-Spatiale/211068352264579', 'review_programmation-de-la-station-spatiale_00.jpg', '', 0, '2011-07-06 16:00:30', '2012-12-12 03:07:32', 93409052, 0, NULL, 0, NULL),
(45, 'Paris Quartier d\'été', 2, 'paris-quartier-d-t', '22e édition du 14 juillet au 9 août.\r\nhttp://www.quartierdete.com/', 'review_paris-quartier-d-t_00.jpg', '', 0, '2011-07-08 22:41:03', '2015-11-03 10:25:34', 34717773, 0, NULL, 0, NULL),
(46, 'le zebre', 133, 'le-zebre', 'test', '', '', 0, '2011-07-09 09:34:13', '2011-07-09 09:34:13', 78010295, 0, NULL, 0, NULL),
(47, 'LA DAME DE CANTON', 154, 'la-dame-de-canton', 'Programmation Concerts & Soirées', 'review_la-dame-de-canton_00.jpg', 'http://damedecanton.com', 0, '2011-07-20 14:08:10', '2016-03-22 09:40:52', 57722257, 1, NULL, 0, NULL),
(48, 'LES SOIREES DE LA CHAPELLE', 118, 'les-soirees-de-la-chapelle', 'VENDREDIS 30 SEPTEMBRE  28 OCTOBRE\r\n25 NOVEMBRE 2011\r\n\r\nA 21H00\r\n\r\nTARIF : 10€ PAR SPECTACLE\r\n\r\nABONNEMENT : 25€00 LES TROIS SOIRÉES', 'review_les-soirees-de-la-chapelle_00.jpg', 'http://www.ville-pierrelatte.fr/', 0, '2011-07-28 18:00:52', '2011-07-29 06:38:54', 46258283, 0, NULL, 0, NULL),
(49, 'Expositions Photo à Paris', 1, 'expositions-photo-paris', 'Un petit programme qui repertorie les expositions photo Parisiennes (et dans la proche banlieue)', 'review_expositions-photo-paris_01.jpg', 'http://cibul.net', 0, '2011-08-04 17:32:49', '2016-03-22 09:50:26', 96631309, 0, NULL, 0, NULL),
(50, 'ma rentree 2011', 4, 'ma-rentree-2011', 'trouver des evenement d\'horticulture je veux me mettre au bonzai', 'review_ma-rentree-2011_00.jpg', 'http://www.veecus.com', 0, '2011-08-18 11:04:15', '2011-08-18 11:04:15', 60331886, 0, NULL, 0, NULL),
(52, 'Septembre 2011', 180, 'septembre-2011', 'Programmation septembre 2011', 'review_septembre-2011_02.jpg', 'http://www.ccserbie.com', 0, '2011-08-23 20:25:26', '2011-08-23 20:40:02', 26590915, 0, NULL, 0, NULL),
(53, 'Le Grand Bivouac', 182, 'le-grand-bivouac', 'festival du voyage et des découvertes partagées, le Grand Bivouac aura lieu du 20 au 23 octobre 2011 à Albertville - Savoie. Conférences, films, expos...', 'review_le-grand-bivouac_01.jpg', 'http://www.grandbivouac.com', 0, '2011-08-26 09:37:29', '2011-08-26 09:38:53', 79072197, 0, NULL, 0, NULL),
(54, 'Mouvement Colibris', 184, 'mouvement-colibris', 'Inspirer, relier et soutenir ceux qui veulent construire une société écologique et humaine', 'review_mouvement-colibris_00.jpg', 'http://www.colibris-lemouvement.org', 0, '2011-08-26 14:55:57', '2011-08-26 14:55:57', 10486563, 0, NULL, 0, NULL),
(55, 'la Boulettologie Moderne', 128, 'la-boulettologie-moderne', 'La Boulettologie Moderne est un point de vue artistique. ', 'review_la-boulettologie-moderne_00.jpg', 'http://www.boulettologie.com', 0, '2011-08-31 11:23:17', '2011-08-31 11:23:17', 82475785, 0, NULL, 0, NULL),
(56, 'Les concerts Rock/Metal/Etc... sur Paris de la semaine du 05 Septembre 2011 ', 191, 'les-concerts-rock-metal-etc-sur-paris-de-la-semaine-du-05-septembre-2011', 'La sélection des concerts rock etc... sur Paris pour le blog lafilledurock.com', '', 'http://www.lafilledurock.com/', 0, '2011-08-31 19:42:18', '2011-08-31 19:42:18', 41681752, 0, NULL, 0, NULL),
(57, 'Avis de Turbulences #7', 1, 'avis-de-turbulences-7', 'Un appel à la diversité, pour que la danse vous transporte...', 'review_avis-de-turbulences-7_00.jpg', 'http://www.etoiledunord-theatre.com/', 0, '2011-09-04 19:25:47', '2016-03-03 14:53:11', 93761158, 0, NULL, 0, NULL),
(59, 'ma sélection', 203, 'ma-s-lection', 'test', '', '', 0, '2011-09-05 12:44:13', '2011-09-05 12:44:13', 89516548, 0, NULL, 0, NULL),
(60, 'CELC Masters of Linen ', 208, 'celc-masters-of-linen', 'Lieu de réflexion, d\'analyse conjoncturelle et d\'orientation stratégique de la filière du Lin. La CELC et le lin soufflent un vent de créativité et d’innovation', 'review_celc-masters-of-linen_02.jpg', 'http://linenandhempcommunity.eu/', 0, '2011-09-06 08:56:07', '2012-11-18 19:36:00', 42940716, 1, NULL, 0, NULL);


--
-- Indexes for dumped tables
--

--
-- Indexes for table ${schema}
--
ALTER TABLE ${schema}
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `slug` (`slug`), ADD UNIQUE KEY `uid` (`uid`), ADD KEY `owner_id_idx` (`owner_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table ${schema}
--
ALTER TABLE ${schema}
MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5396;