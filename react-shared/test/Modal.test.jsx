import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import Modal from '../src/components/Modal.jsx';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../src/components/Tooltip.jsx';

// The outside-click listener is armed with `setImmediate`, which the apps'
// bundles provide and jsdom does not.
beforeAll(() => {
  if (!global.setImmediate) {
    global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
  }
});

// A real click focuses the button it lands on; `fireEvent.click` does not.
const press = (button) => {
  button.focus();
  fireEvent.click(button);
};

function Opener({ label = 'Ouvrir', modalProps = {}, children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open ? (
        <Modal title="Réglages" onClose={() => setOpen(false)} {...modalProps}>
          {children}
        </Modal>
      ) : null}
    </>
  );
}

describe('Modal', () => {
  describe('semantics', () => {
    it('is a modal dialog named by its title', () => {
      render(<Modal title="Réglages">contenu</Modal>);

      const dialog = screen.getByRole('dialog', { name: 'Réglages' });
      expect(dialog.getAttribute('aria-modal')).toBe('true');
    });

    it('is named by `ariaLabel` when it has no title', () => {
      render(<Modal ariaLabel="Aperçu">contenu</Modal>);

      expect(screen.getByRole('dialog', { name: 'Aperçu' })).toBeTruthy();
    });

    it('names its close button in the page language when intl is there', () => {
      render(
        <IntlProvider
          locale="fr"
          messages={{ 'ReactShared.Modal.close': 'Fermer' }}
        >
          <Modal title="Réglages">contenu</Modal>
        </IntlProvider>,
      );

      expect(screen.getByRole('button', { name: 'Fermer' })).toBeTruthy();
    });

    it('falls back to English without intl, and lets `closeLabel` win', () => {
      const { unmount } = render(<Modal title="Réglages">contenu</Modal>);
      expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
      unmount();

      render(
        <Modal title="Réglages" closeLabel="Fermer la fenêtre">
          contenu
        </Modal>,
      );
      expect(
        screen.getByRole('button', { name: 'Fermer la fenêtre' }),
      ).toBeTruthy();
    });
  });

  describe('focus', () => {
    it('moves focus in on open and gives it back on Escape', () => {
      render(
        <Opener>
          <input aria-label="Nom" />
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);

      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Ouvrir' }),
      );
    });

    it('leaves focus where a child put it on mount', () => {
      render(
        <Opener>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input aria-label="Nom" autoFocus />
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      expect(document.activeElement).toBe(
        screen.getByRole('textbox', { name: 'Nom' }),
      );
    });

    it('keeps Tab and Shift+Tab inside the dialog', () => {
      render(
        <>
          <Opener>
            <input aria-label="Nom" />
            <button type="button">Valider</button>
          </Opener>
          <button type="button">Derrière</button>
        </>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      const close = screen.getByRole('button', { name: 'Close' });
      const submit = screen.getByRole('button', { name: 'Valider' });

      submit.focus();
      fireEvent.keyDown(document.activeElement, { key: 'Tab' });
      expect(document.activeElement).toBe(close);

      fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(submit);
    });

    it('skips elements taken out of the tab order at the edges', () => {
      render(
        <Opener>
          <button type="button">Valider</button>
          <input type="file" tabIndex={-1} aria-label="Fichier" />
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      screen.getByRole('button', { name: 'Valider' }).focus();
      fireEvent.keyDown(document.activeElement, { key: 'Tab' });

      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Close' }),
      );
    });
  });

  describe('Escape', () => {
    it('is left to a child that handles it', () => {
      render(
        <Opener>
          <input
            aria-label="Recherche"
            onKeyDown={(e) => {
              if (e.key === 'Escape') e.preventDefault();
            }}
          />
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      screen.getByRole('textbox', { name: 'Recherche' }).focus();
      fireEvent.keyDown(document.activeElement, { key: 'Escape' });

      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('is left to a tooltip in a portal, which closes first', () => {
      render(
        <Opener>
          <Tooltip initialOpen>
            <TooltipTrigger>Aide</TooltipTrigger>
            <TooltipContent>Explication</TooltipContent>
          </Tooltip>
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      expect(screen.getByText('Explication')).toBeTruthy();

      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      expect(screen.queryByText('Explication')).toBeNull();
      expect(screen.getByRole('dialog')).toBeTruthy();

      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes only the top dialog when one opens another', () => {
      render(
        <Opener>
          <Opener label="Détails" modalProps={{ title: 'Détails' }}>
            <p>détails</p>
          </Opener>
        </Opener>,
      );

      press(screen.getByRole('button', { name: 'Ouvrir' }));
      press(screen.getByRole('button', { name: 'Détails' }));
      expect(screen.getAllByRole('dialog')).toHaveLength(2);

      fireEvent.keyDown(document.activeElement, { key: 'Escape' });
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Détails' }),
      );
    });
  });
});
