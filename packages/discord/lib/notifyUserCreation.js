import Discord from 'discord.js';

export default (channel) => (user) => {
  const { fullName, email, uid } = user;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const parisTime = new Date(
    oneHourAgo.toLocaleString('en-US', { timeZone: 'Europe/Paris' }),
  );
  const fromParam = parisTime.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:mm

  const embed = new Discord.MessageEmbed()
    .setColor('#0d944a')
    .setTitle(fullName)
    .setDescription('Nouvel utilisateur')
    .setURL(`https://openagenda.com/admin/users?userUid=${uid}`)
    .addField('Email', email, true)
    .addField(
      'Logs',
      `[Voir les logs](https://openagenda.com/supervisor/users?userUid=${uid}&from=${fromParam})`,
      true,
    );
  return channel.send(embed);
};
