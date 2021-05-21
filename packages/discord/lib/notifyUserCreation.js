'use strict';

const Discord = require('discord.js');

module.exports = channel => user => {
  const { fullName, email, userUid } = user;
  const embed = new Discord.MessageEmbed()
    .setColor('#0d944a')
    .setTitle(fullName)
    .setDescription('Nouvel utilisateur')
    .setURL(`https://openagenda.com/admin/users?userUid=${userUid}`)
    .addField('Email', email);
  return channel.send(embed);
};
