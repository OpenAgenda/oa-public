-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Client :  127.0.0.1:3306
-- Généré le :  Mar 24 Juillet 2018 à 14:37
-- Version du serveur :  5.5.50
-- Version de PHP :  5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Base de données :  `oadev`
--

-- --------------------------------------------------------

--
-- Structure de la table `user_token`
--

CREATE TABLE `user_token` (
  `id` bigint(20) NOT NULL,
  `token` varchar(40) NOT NULL,
  `type` varchar(2) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `salt` varchar(32) DEFAULT NULL,
  `facebook_uid` varchar(255) DEFAULT NULL,
  `twitter_screen_name` varchar(255) DEFAULT NULL,
  `full_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `store` longtext
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `user_token`
--
ALTER TABLE `user_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id_idx` (`user_id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `user_token`
--
ALTER TABLE `user_token`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;
--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `user_token`
--
ALTER TABLE `user_token`
  ADD CONSTRAINT `user_token_user_id_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
