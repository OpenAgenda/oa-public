-- phpMyAdmin SQL Dump
-- version 4.2.8
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 14, 2017 at 11:30 AM
-- Server version: 5.5.55-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `oadev`
--

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE IF NOT EXISTS `review` (
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
  `official` tinyint(1) DEFAULT NULL,
  `credentials` text,
  `settings` text,
  `private` tinyint(1) NOT NULL DEFAULT '0',
  `form_schema_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9861 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`id`, `title`, `owner_id`, `slug`, `description`, `image`, `url`, `collaborative`, `created_at`, `updated_at`, `uid`, `main`, `store`, `contribution_type`, `contribution_info`, `official`, `credentials`, `settings`, `private`, `form_schema_id`) VALUES
(4608, '[Archives] Rendez-vous aux Jardins 2016 [Officiel]', 2, 'rdj2016', 'Les "Rendez-vous aux Jardins" se dérouleront les 3, 4 et 5 juin 2016. Pour participer à l''événement, merci de contacter le référent dans votre région.', NULL, 'http://www.culturecommunication.gouv.fr/Regions', 0, '2015-12-08 16:30:28', '2017-05-18 12:17:52', 62792452, 0, '{"mails":false,"eventFreeText":{"fr":"[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)","en":"[Source: Ministère de la Culture et de la Communication](http://rendezvousauxjardins.culturecommunication.gouv.fr/)"},"keys":[{"hash":"856f1b3a6a8e9e4c5b035dc106bd6c99"}],"order":"relative","form":{"fields":[{"name":"longDescription","placeholder":{"fr":"Description détaillée de l''événement, crédit photo: nom du photographe ","en":"Detailed desecription of the event, photo credits: name of the photograph"}},{"name":"image","info":{"fr":"Ne sélectionnez que les images pour lesquelles vous disposez d''une licence valide.","en":"Only upload images for which you have a valid license"}},{"name":"timings","activeDays":[{"startDate":"2016-06-03","endDate":"2016-06-05"}]},{"name":"keywords","display":false},{"name":"conditions","label":{"fr":"Détail des conditions","en":"Condition details"},"placeholder":{"fr":"Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.","en":"Pricing, availability, minimum number of participants for a group visit, etc."}}]},"moderated":false,"send_invitation_email":true,"contributorconfigstep":-1,"chatbox":false,"moderators":{"canPublish":false},"cFields":{"organization":[],"contact_number":[],"contact_name":[],"contact_position":[],"email":[]},"dataviz":"[]"}', 2, '', 1, '{"moderators":false,"tags":false,"embedsHead":false,"embedsTemplates":false}', '{"contribution":{"type":2,"defaultState":2,"message":null,"useFields":false},"translation":{"enabled":false,"source":"fr","languages":[],"service":"reverso","options":null}}', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `review`
--
ALTER TABLE `review`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `slug` (`slug`), ADD UNIQUE KEY `uid` (`uid`), ADD KEY `owner_id_idx` (`owner_id`);
