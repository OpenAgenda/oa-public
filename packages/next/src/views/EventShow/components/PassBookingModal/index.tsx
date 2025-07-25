import { useEffect, useState } from 'react';
import { Button, Spinner, Center, Text } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import BookingModalBody from './Body';

interface PassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendaUid?: string;
  eventUid?: string;
  timezone?: string;
}

const PassBookingModal = ({
  isOpen,
  onClose,
  agendaUid,
  eventUid,
  timezone,
}: PassBookingModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (isOpen && agendaUid && eventUid) {
      setIsLoading(true);
      setError(null);

      // Fetch booking data
      fetch(`/api/agendas/${agendaUid}/events/${eventUid}/passCulture/bookings`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          setBookingData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching pass bookings:', err);
          setError(
            'Impossible de récupérer les réservations. Veuillez réessayer plus tard.',
          );
          setIsLoading(false);
        });
    }
  }, [isOpen, agendaUid, eventUid]);

  return (
    <DialogRoot size="xl" open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          Réservations pass Culture
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          {isLoading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : error ? (
            <Center py={10}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : (
            <BookingModalBody data={bookingData} timezone={timezone} />
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default PassBookingModal;
