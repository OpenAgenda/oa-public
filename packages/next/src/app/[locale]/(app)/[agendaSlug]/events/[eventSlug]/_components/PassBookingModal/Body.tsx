import { Box, Text, VStack, Table } from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import { formatInTimeZone } from 'date-fns-tz';
import useDateFnsLocale from '@/src/hooks/useDateFnsLocale';

const STATUS_LABELS_FR = {
  CONFIRMED: 'Confirmées',
  USED: 'Utilisées',
  CANCELLED: 'Annulées',
  REIMBURSED: 'Remboursées',
};

const STATUS_HELP_TEXTS = {
  CONFIRMED:
    "Le bénéficiaire a réservé une offre mais il ne l'a pas encore récupérée",
  USED: 'La réservation a été validée par le lieu et sera remboursée lors du prochain paiement',
  CANCELLED:
    'La réservation a été annulée par le bénéficiaire ou par le prestataire',
  REIMBURSED:
    "La réservation a été remboursée par pass Culture au lieu de l'événement",
};

const BookingModalBody = ({ data, timezone }) => {
  const dateFnsLocale = useDateFnsLocale();

  if (!data.total) return <Text>Aucune réservation trouvée.</Text>;

  const totalBookings = data.total;
  const { totalQuantity, statusQuantities } = data.summary;

  const priceCategories = new Set(
    data.bookings.map((b) => b.priceCategoryLabel),
  );
  const showCategory = priceCategories.size > 1;

  const headerCellStyle: React.CSSProperties = {
    fontWeight: 'bold',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  };

  return (
    <VStack align="stretch">
      <Box>
        <Text>
          {totalBookings} réservations pour {totalQuantity} places
        </Text>
        <Text>
          {Object.entries(statusQuantities)
            .filter(([_, qty]) => Number(qty) > 0)
            .map(
              ([status, qty]) =>
                `${STATUS_LABELS_FR[status] || status} : ${qty}`,
            )
            .join(' • ')}
        </Text>
      </Box>

      {/* Liste des réservations */}
      <Box maxH="60vh" overflowY="auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader style={headerCellStyle}>
                Nom
              </Table.ColumnHeader>
              <Table.ColumnHeader style={headerCellStyle}>
                Email
              </Table.ColumnHeader>
              <Table.ColumnHeader style={headerCellStyle}>
                Quantité
              </Table.ColumnHeader>
              <Table.ColumnHeader style={headerCellStyle}>
                Statut
              </Table.ColumnHeader>
              {showCategory && (
                <Table.ColumnHeader style={headerCellStyle}>
                  Catégorie
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader style={headerCellStyle}>
                Date et heure
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.bookings.map((b) => (
              <Table.Row key={b.id}>
                <Table.Cell>
                  <Text>
                    {b.userFirstName} {b.userLastName}
                  </Text>
                </Table.Cell>
                <Table.Cell>{b.userEmail}</Table.Cell>
                <Table.Cell>{b.quantity}</Table.Cell>
                <Table.Cell>
                  <Tooltip
                    content={
                      STATUS_HELP_TEXTS[b.status] || 'Aucun détail disponible'
                    }
                  >
                    <Text style={{ cursor: 'help' }}>
                      {STATUS_LABELS_FR[b.status] || b.status}
                    </Text>
                  </Tooltip>
                </Table.Cell>
                {showCategory && (
                  <Table.Cell>{b.priceCategoryLabel}</Table.Cell>
                )}
                <Table.Cell>
                  {b.date?.beginningDatetime ? (
                    <Text>
                      {formatInTimeZone(
                        new Date(b.date.beginningDatetime),
                        timezone || 'Europe/Paris',
                        'dd/MM/yyyy HH:mm',
                        {
                          locale: dateFnsLocale,
                        },
                      )}
                    </Text>
                  ) : (
                    <Text color="gray.500">-</Text>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </VStack>
  );
};

export default BookingModalBody;
