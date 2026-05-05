import EmbedEventError from './_components/EmbedEventError';

export default function EmbedEventNotFound() {
  return <EmbedEventError statusCode={404} />;
}
