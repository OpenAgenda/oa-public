import { chakra, Link } from '@openagenda/uikit';

export default function Footer({ agenda }) {
  return (
    <footer>
      <Link href="/" colorScheme="primary">OpenAgenda</Link>
      {' · '}
      <Link href="https://doc.openagenda.com" isExternal colorScheme="primary">Aide</Link>
      {' · '}
      <Link href="https://doc.openagenda.com/conditions/" colorScheme="primary">Conditions d&apos;utilisation</Link>
      {' · '}
      <chakra.span color="oaGray.500">
        &lt;uid:{agenda.uid}&gt;
      </chakra.span>
    </footer>
  );
}
