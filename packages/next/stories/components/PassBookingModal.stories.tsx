import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { Box, Button, Text, VStack } from '@openagenda/uikit';
import fetchLocale from 'app/locales';
import PassBookingModal from '../../src/views/EventShow/components/PassBookingModal';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import passBookings from './fixtures/passBookings.json';

export default {
  title: 'components/PassModal',
  component: PassBookingModal,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

export const Interactive = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Box p={4}>
      <Button onClick={handleOpen} colorScheme="blue" mb={4}>
        Open Modal
      </Button>

      <PassBookingModal
        isOpen={isOpen}
        onClose={handleClose}
        agendaUid="123"
        eventUid="456"
        timezone="Europe/Paris"
      />
    </Box>
  );
};

Interactive.parameters = {
  msw: {
    handlers: [
      http.get('/api/agendas/123/events/456/passCulture/bookings', () =>
        HttpResponse.json(passBookings),
      ),
    ],
  },
};

export const WithLoader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Box p={4}>
      <Button onClick={handleOpen} colorScheme="blue" mb={4}>
        Open Modal (with loading delay)
      </Button>

      <PassBookingModal
        isOpen={isOpen}
        onClose={handleClose}
        agendaUid="123"
        eventUid="456"
        timezone="Europe/Paris"
      />
    </Box>
  );
};

WithLoader.parameters = {
  msw: {
    handlers: [
      http.get('/api/agendas/123/events/456/passCulture/bookings', async () => {
        // Simulate network delay to show loader
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return HttpResponse.json(passBookings);
      }),
    ],
  },
};

export const WithError = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Box p={4}>
      <Button onClick={handleOpen} colorScheme="blue" mb={4}>
        Open Modal (with error)
      </Button>

      <PassBookingModal
        isOpen={isOpen}
        onClose={handleClose}
        agendaUid="123"
        eventUid="456"
        timezone="Europe/Paris"
      />
    </Box>
  );
};

WithError.parameters = {
  msw: {
    handlers: [
      http.get('/api/agendas/123/events/456/passCulture/bookings', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    ],
  },
};

export const AllStates = () => {
  const [isOpenNormal, setIsOpenNormal] = useState(false);
  const [isOpenLoader, setIsOpenLoader] = useState(false);
  const [isOpenError, setIsOpenError] = useState(false);

  return (
    <VStack align="flex-start" gap={4} p={4}>
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Normal Response
        </Text>
        <Button onClick={() => setIsOpenNormal(true)} colorScheme="blue">
          Open Modal
        </Button>
        <PassBookingModal
          isOpen={isOpenNormal}
          onClose={() => setIsOpenNormal(false)}
          agendaUid="123"
          eventUid="normal"
          timezone="Europe/Paris"
        />
      </Box>

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          With Loading Delay
        </Text>
        <Button onClick={() => setIsOpenLoader(true)} colorScheme="blue">
          Open Modal with Loader
        </Button>
        <PassBookingModal
          isOpen={isOpenLoader}
          onClose={() => setIsOpenLoader(false)}
          agendaUid="123"
          eventUid="loading"
          timezone="Europe/Paris"
        />
      </Box>

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          With Error
        </Text>
        <Button onClick={() => setIsOpenError(true)} colorScheme="blue">
          Open Modal with Error
        </Button>
        <PassBookingModal
          isOpen={isOpenError}
          onClose={() => setIsOpenError(false)}
          agendaUid="123"
          eventUid="error"
          timezone="Europe/Paris"
        />
      </Box>
    </VStack>
  );
};

AllStates.parameters = {
  msw: {
    handlers: [
      http.get('/api/agendas/123/events/normal/passCulture/bookings', () => {
        return HttpResponse.json(passBookings);
      }),
      http.get(
        '/api/agendas/123/events/loading/passCulture/bookings',
        async () => {
          // Simulate network delay to show loader
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return HttpResponse.json(passBookings);
        },
      ),
      http.get('/api/agendas/123/events/error/passCulture/bookings', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    ],
  },
};
