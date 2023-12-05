import { Tag } from '@openagenda/uikit';

export default function StatusTag({ status }) {
  switch (status) {
    case 2:
      return (
        <Tag variant="solid" colorScheme="warning">
          Reprogrammé
        </Tag>
      );
    case 3:
      return (
        <Tag variant="solid" colorScheme="warning">
          En ligne
        </Tag>
      );
    case 4:
      return (
        <Tag variant="solid" colorScheme="warning">
          Reporté
        </Tag>
      );
    case 5:
      return (
        <Tag variant="solid" colorScheme="danger">
          Complet
        </Tag>
      );
    case 6:
      return (
        <Tag variant="solid" colorScheme="danger">
          Annulé
        </Tag>
      );
    default:
      return null;
  }
}
