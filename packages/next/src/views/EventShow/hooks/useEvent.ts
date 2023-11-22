import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

type Event = {
  uid: number
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  dateRange: Record<string, string>
  timings: {
    begin: string
    end: string
  }[]
  image?: {
    size?: {
      width: number
      height: number
    }
    filename: string
  }
  imageCredits?: string
  longDescription?: Record<string, string>
  keywords?: Record<string, string[]>
  createdAt: string
  updatedAt: string
  location?: {
    agendaUid: number
    name: string
    address: string
    tags?: {
      id: number
      label: string
    }[]
    description?: Record<string, string>
    access?: Record<string, string>
    image?: string
    imageCredits?: string
    website?: string
    phone?: string
    links?: string[]
  }
  state: number
};

async function fetcher(url: string) {
  const response = await fetch(url);
  if (response.ok) return response.json();
  // TODO should recreate an error with data in `await r.json()` and/or status
  throw new Error('Error');
}

export default function useEvent() {
  const router = useRouter();
  const { agendaSlug, eventSlug } = router.query;

  const {
    data,
    ...rest
  } = useSWRImmutable<{ success: boolean, event: Event }>(
    `/api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`,
    fetcher,
  );

  return { event: data.event, ...rest };
}
