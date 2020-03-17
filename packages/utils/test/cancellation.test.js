'use strict';

const determineCancellationFromTitle = require('../cancellation/determineFromTitle');
const injectCancellationInTitle = require('../cancellation/injectInTitle');
const stripCancellationFromTitle = require('../cancellation/stripFromTitle');

describe('utils - cancellation', () => {

  describe('stripCancellationFromTitle', () => {

    it('removes Cancelled from the beginning of the title in each language', () => {
      const uncancelled = stripCancellationFromTitle({
        fr: 'Annulé | Entrée libre et gratuite au Musée des Amériques-Auch',
        de: 'Abgesagt | Freier und kostenloser Eintritt ins Amerikanische Museum',
        en: 'Cancelled | Free admission to the Museum of the Americas-Auch',
        es: 'Cancelado | Entrada libre y gratuita en el Museo de las Américas-Auch',
        it: 'Cancellato | Ingresso libero e gratuito al Museo delle Americhe-Auch'
      });

      expect(uncancelled).toEqual({
        fr: 'Entrée libre et gratuite au Musée des Amériques-Auch',
        de: 'Freier und kostenloser Eintritt ins Amerikanische Museum',
        en: 'Free admission to the Museum of the Americas-Auch',
        es: 'Entrada libre y gratuita en el Museo de las Américas-Auch',
        it: 'Ingresso libero e gratuito al Museo delle Americhe-Auch'
      });
    });

  });

  describe('injectCancellationInTitle', () => {

    it('injects Cancelled at the beginning of the title in each language', () => {
      const cancelled = injectCancellationInTitle({
        fr: 'Entrée libre et gratuite au Musée des Amériques-Auch',
        de: 'Freier und kostenloser Eintritt ins Amerikanische Museum',
        en: 'Free admission to the Museum of the Americas-Auch',
        es: 'Entrada libre y gratuita en el Museo de las Américas-Auch',
        it: 'Ingresso libero e gratuito al Museo delle Americhe-Auch'
      });

      expect(cancelled).toEqual({
        fr: 'Annulé | Entrée libre et gratuite au Musée des Amériques-Auch',
        de: 'Abgesagt | Freier und kostenloser Eintritt ins Amerikanische Museum',
        en: 'Cancelled | Free admission to the Museum of the Americas-Auch',
        es: 'Cancelado | Entrada libre y gratuita en el Museo de las Américas-Auch',
        it: 'Cancellato | Ingresso libero e gratuito al Museo delle Americhe-Auch'
      });
    });

    it('if Title is too long, it is truncated', () => {
      const cancelled = injectCancellationInTitle({
        fr: `On sait depuis longtemps que travailler avec du texte lisible et contenant du sens est source de distractions, et empêche de se concentrer sur la mise en page elle-même. L'avantage du Lorem Ipsum sur un texte générique comme 'Du texte. Du texte. Du texte.' est qu'il possède une distribution de lettres plus ou moins normale, et en tout cas comparable avec celle du français standard. De nombreuses suites logicielles de mise en page ou éditeurs de sites Web ont fait du Lorem Ipsum leur faux texte par défaut, et une recherche pour 'Lorem Ipsum' vous conduira vers de nombreux sites qui n'en sont encore qu'à leur phase de construction. Plusieurs versions sont apparues avec le temps, parfois par accident, souvent intentionnellement (histoire d'y rajouter de petits clins d'oeil, voire des phrases embarassantes).`
      });

      expect(cancelled.fr.length).toEqual(140);
    });

  });

  describe('determineCancellationFromTitle', () => {

    it('returns true if title begins with "Annulé"', () => {
      const isCancelled = determineCancellationFromTitle({
        fr: 'Annulé - Le titre'
      });

      expect(isCancelled).toEqual(true);
    });

    it('returns true if title begins with "Annulé"', () => {
      const isCancelled = determineCancellationFromTitle({
        fr: 'ANNULE - Le titre'
      });

      expect(isCancelled).toEqual(true);
    });

    it('returns true if title begins with [Annulé]', () => {
      const isCancelled = determineCancellationFromTitle({
        fr: '[Annulé] - Le titre'
      });

      expect(isCancelled).toEqual(true);
    });

    it('returns true if title begins with "Cancelled"', () => {
      const isCancelled = determineCancellationFromTitle({
        en: 'Cancelled - The title'
      });

      expect(isCancelled).toEqual(true);
    });

  });

});
