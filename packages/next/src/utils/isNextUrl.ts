export const agendaShowUrlRegex = /^\/[^/]+\/?$/;
export const eventShowUrlRegex = /^\/[^/]+\/events\/[^/]+\/?$/;
export const embedAgendaUrlRegex = /^\/embed\/agendas\/[^/]+\/?$/;
export const embedEventUrlRegex = /^\/embed\/agendas\/[^/]+\/events\/[^/]+\/?$/;
export const agendasSearchUrlRegex = /^\/agendas\/?$/;

const internalUrlRegexes = [
  agendaShowUrlRegex,
  eventShowUrlRegex,
  embedAgendaUrlRegex,
  embedEventUrlRegex,
  agendasSearchUrlRegex,
];

export default function isNextUrl(url: string): boolean {
  return internalUrlRegexes.some((regex) => regex.test(url));
}
