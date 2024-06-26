import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

type Timing = {
  begin: string
  end: string
};

type Registration = {
  type: string
  value: string
  service: string
};

export type Event = {
  uid: number
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  dateRange: Record<string, string>
  timezone: string
  timings: Timing[]
  nextTiming: Timing | null
  lastTiming: Timing
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
  conditions?: Record<string, string>
  registration?: Registration[]
  accessibility: {
    ii: boolean // accessibleToIntellectually
    hi: boolean // accessibleToHearing
    vi: boolean // accessibleToVisually
    pi: boolean // accessibleToPsychic
    mi: boolean // accessibleToMotor
  }
  age?: {
    min: number
    max: number
  }
  createdAt: string
  updatedAt: string
  location?: {
    uid: number
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
    latitude?: number
    longitude?: number
    setUid?: number
  }
  onlineAccessLink?: string
  state: number
  featured: boolean
  originAgenda: {
    uid: number
    image: string
    title: string
  }
  status: number
  private: boolean
  ownerUid: number
  passCulture?: {
    service: string
    type: string
    value: string
    img: string
    label: string
  }
};

export default function useEvent() {
  const router = useRouter();
  const { agendaSlug, eventSlug } = router.query;

  const {
    data,
    ...rest
  } = useSWRImmutable<{ success: boolean, event: Event }>(
    `/api/agendas/slug/${agendaSlug}/events/slug/${eventSlug}?longDescriptionFormat=HTMLWithEmbeds`,
  );

  return { event: data.event, ...rest };
}
