'use strict';

const Discord = require('discord.js');

module.exports = channel => (agenda, user) => {
  const { uid, title } = agenda;
  const { fullName, email, uid: userUid } = user;
  const embed = new Discord.MessageEmbed()
    .setColor('#3f97fc')
    .setTitle(title)
    .setDescription('Nouvel agenda')
    .addFields(
      {
        name: `Créé par ${fullName}`,
        value: `[Admin user](https://openagenda.com/admin/users?userUid=${userUid})`,
        inline: true,
      },
      { name: 'Email', value: email, inline: true },
      { name: 'Admin', value: `[Admin agenda](https://openagenda.com/admin/agendas?agendaUid=${uid})` }
    )
    .setURL(`https://openagenda.com/agendas/${uid}`);
  return channel.send(embed);
};
