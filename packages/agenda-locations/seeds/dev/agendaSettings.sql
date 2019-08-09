-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Lun 24 Octobre 2016 à 09:03
-- Version du serveur :  5.7.15-0ubuntu0.16.04.1-log
-- Version de PHP :  5.6.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `oadev`
--

-- --------------------------------------------------------

--
-- Structure de la table `${schema}`
--

CREATE TABLE IF NOT EXISTS `${schema}`
(
    agenda_id BIGINT UNIQUE NOT NULL,
    store     LONGTEXT,
    PRIMARY KEY (agenda_id)
) DEFAULT CHARACTER
      SET utf8
  COLLATE utf8_general_ci
  ENGINE = INNODB;

--
-- Contenu de la table `${schema}`
--

INSERT INTO `${schema}` (agenda_id, store)
VALUES (123,
        '{"eventForm":{"detailed":true},"translation":{"enabled":true,"options":"eyJ1c2VyIjoiQ1VMVFVSRSIsInBhc3N3b3JkIjoiclU3elQ3cWhhIn0=","service":"reverso","sets":[{"source":"fr","checked":["it","es"],"target":["it","es","de"]}],"source":"fr"},"labels":{"translationInfo":{"fr":"C''est pour traduire automatiquement","en":"Translate au-to-ma-ti-ca-lly"},"name":{"en":"Name of the location of the event","fr":"Saisissez le nom du lieu de l’événement"},"namePlaceholder":{"fr":"Ex : Ministère de la Culture","en":"Ex : Ministry of culture"},"addressInfo":{"en":"Indicate the number, name of the street, the name and postal code of the city","fr":"Indiquez le numéro, le nom de la voie, le nom et le code postal de la commune. Une fois le champ « Adresse » complété, vérifiez sur la carte ci-dessous que le pointeur est correctement situé. Vous pouvez le déplacer manuellement si nécessaire."},"addressPlaceholder":{"en":"Ex : 03 rue de Valois 75001 Paris","fr":"Ex : 03 rue de Valois 75001 Paris"},"imageCredits":{"en":"Image credits","fr":"Crédits de l’image"},"imageCreditsInfo":{"en":"Indicate the owner of the image. If the image is under an open license, please specify which.","fr":"Indiquez le propriétaire de l''image. Si l''image est sous licence libre, merci de le préciser."},"descriptionInfo":{"en":"Describe your garden (its history, particularities, the type of offered activities, etc).","fr":"Présentez votre jardin (son histoire, ses particularités, le type d’activités proposé, etc)."},"descriptionPlaceholder":{"en":"a custom placeholder","fr":"un placeholder"},"accessInfo":{"en":"Indicate the access conditions to your location","fr":"Indiquez les conditions d’accès à votre lieu (transports à proximité, présence de parkings, aménagements spécifiques, etc)."},"phoneInfo":{"en":"Indicate a contact phone number for the public","fr":"Indiquez un numéro de téléphone pour les demandes du public (standard, tél. fixe)."},"websiteInfo":{"en":"indicate the website of the location if any","fr":"Indiquez l’adresse de votre site Internet, si existant (inclure le http://)."},"create":{"info":{"fr":"Info custo","en":"Custom info"}}},"tagSet":{"groups":[{"name":"Label","info":null,"tags":[{"id":40,"label":"Musée de France"},{"id":38,"label":"Jardin Remarquable"},{"id":34,"label":"Patrimoine"},{"id":35,"label":"Patrimoine européen"},{"id":36,"label":"Villes et pays art/histoire"},{"id":37,"label":"Patrimoine unesco"},{"id":39,"label":"Tourisme et handicap"},{"id":41,"label":"\"Maison illustre"}]},{"name":"Particularité","required":true,"info":null,"tags":[{"id":33,"label":"Première participation"},{"id":32,"label":"Ouverture exceptionnelle"}]},{"name":"Types de lieu","info":null,"tags":[{"id":16,"label":"Edifice commémoratif"},{"id":3,"label":"Édifice religieux"},{"id":1,"label":"Personne Célebre"},{"id":2,"label":"Château, hôtel urbain, palais, manoir"},{"id":4,"label":"Édifice hospitalier"},{"id":5,"label":"Édifice maritime"},{"id":6,"label":"Édifice militaire"},{"id":7,"label":"Archive"},{"id":8,"label":"Édifice industriel"},{"id":9,"label":"Édifice rural"},{"id":10,"label":"Édifice scolaire"},{"id":11,"label":"Édifice naturel"},{"id":12,"label":"Mémoire"},{"id":13,"label":"Un truc pas vide"},{"id":14,"label":"Pouvoir"},{"id":15,"label":"Musée"},{"id":17,"label":"Beaux-Art"},{"id":18,"label":"Art contemporain"},{"id":19,"label":"Arts décoratifs"},{"id":20,"label":"Sciences et Techniques"},{"id":21,"label":"Insolites"},{"id":22,"label":"Société et civilisation"},{"id":23,"label":"Jardin d''inspiration médiévale"},{"id":24,"label":"Jardin régulier (à la française)"},{"id":25,"label":"Parc paysager (à l''anglaise)"},{"id":26,"label":"Jardin XXe siècle"},{"id":27,"label":"Jardin de création récente"},{"id":28,"label":"Jardin de collection (botanique, arboretum...)"},{"id":29,"label":"Jardin vivrier (potager, verger, jardins familiaux, jardin de simples...)"},{"id":30,"label":"Jardin privé"},{"id":31,"label":"Jardin public"}]}]}}');

/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
