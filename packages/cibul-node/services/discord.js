import Discord from '@openagenda/discord';

export function init({ discord }) {
  return Discord({
    token: discord.token,
    channel: discord.channel,
  });
}
