import EmbedAgendaError from './_components/EmbedAgendaError';

export default function EmbedAgendaNotFound() {
  return <EmbedAgendaError statusCode={404} />;
}
