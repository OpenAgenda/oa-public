

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
  id BIGINT AUTO_INCREMENT,
  uid BIGINT UNIQUE,
  main TINYINT(1) DEFAULT '0' NOT NULL,
  official TINYINT(1) DEFAULT '0' NOT NULL,
  officialized_at DATETIME,
  private TINYINT(1) DEFAULT '0' NOT NULL,
  title VARCHAR(255) NOT NULL,
  owner_id BIGINT NOT NULL,
  form_schema_id BIGINT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(165), /* 150 in real world */
  image VARCHAR(255),
  url VARCHAR(255),
  collaborative TINYINT(1) DEFAULT '0' NOT NULL,
  contribution_type TINYINT DEFAULT 0 NOT NULL,
  contribution_info TEXT,
  store TEXT,
  credentials TEXT,
  settings TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX owner_id_idx (owner_id),
  PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;

--
-- Dumping data for table ${schema}
--

INSERT INTO ${schema} (`id`, `title`, `owner_id`, `slug`, `description`, `image`, `url`, `collaborative`, `created_at`, `updated_at`, `uid`, `main`, `store`, `contribution_type`, `contribution_info`) VALUES
(4608, 'Rendez-vous aux Jardins 2016 [Officiel]', 2, 'rdj2016', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2016-03-21 18:42:03', 62792452, 0, '{\r\n  "eventFreeText": {\r\n    "fr": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)",\r\n    "en": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"\r\n  },\r\n  "keys": [\r\n    {\r\n      "hash": "856f1b3a6a8e9e4c5b035dc106bd6c99"\r\n    }\r\n  ],\r\n  "order": "relative",\r\n  "form": {\r\n    "fields": [\r\n      {\r\n        "name": "longDescription",\r\n        "placeholder": {\r\n          "fr": "Description détaillée de l''événement, crédit photo: nom du photographe ",\r\n          "en": "Detailed desecription of the event, photo credits: name of the photograph"\r\n        }\r\n      },\r\n      {\r\n        "name": "image",\r\n        "info": {\r\n          "fr": "Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.",\r\n          "en": "Only upload images for which you have a valid license"\r\n        }\r\n      },\r\n      {\r\n        "name": "timings",\r\n        "activeDays": [\r\n          {\r\n            "startDate": "2016-06-03",\r\n            "endDate": "2016-06-05"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        "name": "keywords",\r\n        "display": false\r\n      },\r\n      {\r\n        "name": "conditions",\r\n        "label": {\r\n          "fr": "Détail des conditions",\r\n          "en": "Condition details"\r\n        },\r\n        "placeholder": {\r\n          "fr": "Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.",\r\n          "en": "Pricing, availability, minimum number of participants for a group visit, etc."\r\n        }\r\n      }\r\n    ]\r\n  },\r\n  "moderated": true,\r\n  "send_invitation_email": true,\r\n  "contributorconfigstep": -1,\r\n  "chatbox": true,\r\n  "moderators": {\r\n    "canPublish": false\r\n  },\r\n  "cFields": {\r\n    "organization": [],\r\n    "contact_number": [],\r\n    "contact_name": [],\r\n    "contact_position": [],\r\n "email":[]\r\n  },\r\n  "dataviz": "[]"\r\n}', 2, 'Un guide d''aide à la saisie est disponible à cette adresse : http://rendezvousauxjardins.culturecommunication.gouv.fr/Guide-d-aide-a-la-saisie\r\n\r\nNous comptons sur votre pleine mobilisation pour que cet agenda soit le plus complet et attractif possible et qu''il donne goût aux internautes de découvrir les belles initiatives que vous portez partout en France à l''occasion de cette manifestation.\r\n\r\nBonne contribution !\r\n\r\nLe Ministère de la Culture et de la Communication'),
(4609, 'Rendez-vous aux Jardins 2016 [Bis]', 2, 'rdj2016b', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2016-03-21 18:42:03', 6272452, 0, '{\r\n  "eventFreeText": {\r\n    "fr": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)",\r\n    "en": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"\r\n  },\r\n  "keys": [\r\n    {\r\n      "hash": "856f1b3a6a8e9e4c5b035dc106bd6c99"\r\n    }\r\n  ],\r\n  "order": "relative",\r\n  "form": {\r\n    "fields": [\r\n      {\r\n        "name": "longDescription",\r\n        "placeholder": {\r\n          "fr": "Description détaillée de l''événement, crédit photo: nom du photographe ",\r\n          "en": "Detailed desecription of the event, photo credits: name of the photograph"\r\n        }\r\n      },\r\n      {\r\n        "name": "image",\r\n        "info": {\r\n          "fr": "Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.",\r\n          "en": "Only upload images for which you have a valid license"\r\n        }\r\n      },\r\n      {\r\n        "name": "timings",\r\n        "activeDays": [\r\n          {\r\n            "startDate": "2016-06-03",\r\n            "endDate": "2016-06-05"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        "name": "keywords",\r\n        "display": false\r\n      },\r\n      {\r\n        "name": "conditions",\r\n        "label": {\r\n          "fr": "Détail des conditions",\r\n          "en": "Condition details"\r\n        },\r\n        "placeholder": {\r\n          "fr": "Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.",\r\n          "en": "Pricing, availability, minimum number of participants for a group visit, etc."\r\n        }\r\n      }\r\n    ]\r\n  },\r\n  "moderated": true,\r\n  "send_invitation_email": true,\r\n  "contributorconfigstep": -1,\r\n  "chatbox": true,\r\n  "moderators": {\r\n    "canPublish": false\r\n  },\r\n  "cFields": {\r\n    "organization": [],\r\n  "contact_name": [],\r\n    "contact_position": []\r\n  },\r\n  "dataviz": "[]"\r\n}', 2, 'Un guide d''aide à la saisie est disponible à cette adresse : http://rendezvousauxjardins.culturecommunication.gouv.fr/Guide-d-aide-a-la-saisie\r\n\r\nNous comptons sur votre pleine mobilisation pour que cet agenda soit le plus complet et attractif possible et qu''il donne goût aux internautes de découvrir les belles initiatives que vous portez partout en France à l''occasion de cette manifestation.\r\n\r\nBonne contribution !\r\n\r\nLe Ministère de la Culture et de la Communication'),
(4610, 'Rendez-vous aux Jardins 2016 [noCFIelds]', 2, 'rdj2016c', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2016-03-21 18:42:03', 622452, 0, '{\r\n  "eventFreeText": {\r\n    "fr": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)",\r\n    "en": "[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"\r\n  },\r\n  "keys": [\r\n    {\r\n      "hash": "856f1b3a6a8e9e4c5b035dc106bd6c99"\r\n    }\r\n  ],\r\n  "order": "relative",\r\n  "form": {\r\n    "fields": [\r\n      {\r\n        "name": "longDescription",\r\n        "placeholder": {\r\n          "fr": "Description détaillée de l''événement, crédit photo: nom du photographe ",\r\n          "en": "Detailed desecription of the event, photo credits: name of the photograph"\r\n        }\r\n      },\r\n      {\r\n        "name": "image",\r\n        "info": {\r\n          "fr": "Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.",\r\n          "en": "Only upload images for which you have a valid license"\r\n        }\r\n      },\r\n      {\r\n        "name": "timings",\r\n        "activeDays": [\r\n          {\r\n            "startDate": "2016-06-03",\r\n            "endDate": "2016-06-05"\r\n          }\r\n        ]\r\n      },\r\n      {\r\n        "name": "keywords",\r\n        "display": false\r\n      },\r\n      {\r\n        "name": "conditions",\r\n        "label": {\r\n          "fr": "Détail des conditions",\r\n          "en": "Condition details"\r\n        },\r\n        "placeholder": {\r\n          "fr": "Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.",\r\n          "en": "Pricing, availability, minimum number of participants for a group visit, etc."\r\n        }\r\n      }\r\n    ]\r\n  },\r\n  "moderated": true,\r\n  "send_invitation_email": true,\r\n  "contributorconfigstep": -1,\r\n  "chatbox": true,\r\n  "moderators": {\r\n    "canPublish": false\r\n  },\r\n "dataviz": "[]"\r\n}', 2, 'Un guide d''aide à la saisie est disponible à cette adresse : http://rendezvousauxjardins.culturecommunication.gouv.fr/Guide-d-aide-a-la-saisie\r\n\r\nNous comptons sur votre pleine mobilisation pour que cet agenda soit le plus complet et attractif possible et qu''il donne goût aux internautes de découvrir les belles initiatives que vous portez partout en France à l''occasion de cette manifestation.\r\n\r\nBonne contribution !\r\n\r\nLe Ministère de la Culture et de la Communication');

--
-- Indexes for dumped tables
--
