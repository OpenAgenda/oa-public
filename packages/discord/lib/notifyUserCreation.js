import Discord from 'discord.js';

export default (channel) => (user) => {
  const { fullName, email, uid } = user;
  const embed = new Discord.MessageEmbed()
    .setColor('#0d944a')
    .setTitle(fullName)
    .setDescription('Nouvel utilisateur')
    .setURL(`https://openagenda.com/admin/users?userUid=${uid}`)
    .addField('Email', email, true)
    .addField(
      'Logs',
      `[Voir les logs](https://openagenda.com/supervisor/users?userUid=${uid})`,
      true,
    );
  return channel.send(embed);
};
