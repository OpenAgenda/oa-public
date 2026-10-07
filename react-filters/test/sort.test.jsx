/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';
import Sort from '../src/components/Sort.jsx';
import FiltersManager from '../src/components/FiltersManager.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderSort(sortProps = {}, initialValues = {}) {
  let form;

  function GrabForm() {
    form = useForm();
    useField('search', { subscription: {} });
    return null;
  }

  const { container } = render(
    <IntlProvider locale="en">
      <FiltersProvider
        filters={[]}
        onSubmit={() => {}}
        initialValues={initialValues}
      >
        <GrabForm />
        <Sort {...sortProps} />
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    container,
    form: () => form,
    change: (name, value) => act(() => form.change(name, value)),
    openMenu: () =>
      act(() => {
        fireEvent.keyDown(container.querySelector('input'), {
          key: 'ArrowDown',
        });
      }),
  };
}

// the label of each menu option, without its detail line
const optionLabels = (container) =>
  [...container.querySelectorAll('[id*="-option-"]')].map(
    (el) =>
      el.querySelector('.oa-filters-sort-label')?.textContent ?? el.textContent,
  );

describe('Sort', () => {
  test('offers the public listing orders by default, without relevance until a search', () => {
    const { container, openMenu } = renderSort();

    // the short label in the closed select, the full one in the menu
    expect(screen.getByText('Chronological')).toBeTruthy();

    openMenu();

    // a single chronological order, so its short label is unambiguous
    expect(optionLabels(container)).toEqual([
      'Featured first, chronological (last date)',
    ]);
  });

  test('offers relevance only while a search is typed', () => {
    const { container, change, openMenu } = renderSort();

    change('search', 'concert');
    openMenu();

    expect(optionLabels(container)).toEqual([
      'Featured first, chronological (last date)',
      'Relevance',
    ]);
  });

  test('labels every standard order, in the order of `options`', () => {
    const { container, openMenu } = renderSort({
      options: [
        'updatedAt.asc',
        'lastTiming.asc',
        'timings.asc',
        'updatedAt.desc',
      ],
    });

    openMenu();

    expect(optionLabels(container)).toEqual([
      'Least recently updated',
      'Chronological (last date)',
      'Chronological order',
      'Recently updated',
    ]);
  });

  test('shows the first option when the default is not offered', () => {
    renderSort({
      options: ['timings.asc', 'score'],
      defaultValue: 'updatedAt.desc',
    });

    expect(screen.getByText('Chronological')).toBeTruthy();
    expect(screen.queryByText('updatedAt.desc')).toBeNull();
  });

  test('shows the sort of the initial query', () => {
    renderSort(
      { options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'] },
      { sort: 'updatedAt.desc' },
    );

    expect(screen.getByText('Recently updated')).toBeTruthy();
  });

  test('names an initial sort the select does not offer', () => {
    renderSort(
      { options: ['lastTimingWithFeatured.asc'] },
      { sort: 'timings.asc' },
    );

    expect(screen.getByText('Chronological')).toBeTruthy();
    expect(screen.queryByText('timings.asc')).toBeNull();
  });

  test('shows a detail line under each option in the menu only', () => {
    const { container, openMenu } = renderSort({
      options: ['updatedAt.desc', 'timings.asc'],
      defaultValue: 'updatedAt.desc',
      descriptions: { 'timings.asc': 'Soonest first' },
    });

    // the closed select shows the label alone
    expect(screen.queryByText('Last modified events first')).toBeNull();

    openMenu();

    expect(
      [...container.querySelectorAll('.oa-filters-sort-description')].map(
        (el) => el.textContent,
      ),
    ).toEqual(['Last modified events first', 'Soonest first']);
  });

  test('shows labels only when descriptions are off', () => {
    const { container, openMenu } = renderSort({
      options: ['updatedAt.desc'],
      descriptions: false,
    });

    openMenu();

    expect(container.querySelector('.oa-filters-sort-description')).toBeNull();
  });

  test('shows the short label in the closed select, the label in the menu', () => {
    const { container, openMenu } = renderSort({
      options: ['lastTimingWithFeatured.asc'],
      labels: { 'lastTimingWithFeatured.asc': 'Chronological by last date' },
      shortLabels: { 'lastTimingWithFeatured.asc': 'Chronological' },
    });

    expect(screen.getByText('Chronological')).toBeTruthy();

    openMenu();

    expect(optionLabels(container)).toEqual(['Chronological by last date']);
  });

  test('names the select "Sort by" by default', () => {
    renderSort();

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeTruthy();
  });

  test('takes another accessible name', () => {
    renderSort({ label: 'Order the events' });
    expect(
      screen.getByRole('combobox', { name: 'Order the events' }),
    ).toBeTruthy();
  });

  test('leaves the name to an outside <label> when label is false', () => {
    const { container } = renderSort({ label: false });

    expect(container.querySelector('input').getAttribute('aria-label')).toBe(
      null,
    );
  });

  test("prefers the integration's label over the default short one", () => {
    renderSort({
      options: ['lastTimingWithFeatured.asc'],
      labels: { 'lastTimingWithFeatured.asc': 'Public view' },
    });

    expect(screen.getByText('Public view')).toBeTruthy();
    expect(screen.queryByText('Chronological')).toBeNull();
  });

  test('takes label overrides', () => {
    renderSort({
      options: ['lastTimingWithFeatured.asc'],
      labels: { 'lastTimingWithFeatured.asc': 'Public view' },
    });

    expect(screen.getByText('Public view')).toBeTruthy();
  });

  test('switches to relevance on a first search, and back when it is cleared', () => {
    const { change, form } = renderSort({
      options: ['score', 'updatedAt.desc'],
    });

    change('sort', 'updatedAt.desc');
    change('search', 'concert');
    expect(form().getState().values.sort).toBe('score');

    change('search', '');
    expect(form().getState().values.sort).toBe('updatedAt.desc');
  });

  test('never brings relevance back once the search is cleared', () => {
    // a shared link or a reload after a search carries sort=score
    const { change, form } = renderSort(
      { options: ['score', 'updatedAt.desc'] },
      { search: 'jazz', sort: 'score' },
    );

    change('search', '');

    expect(form().getState().values.sort).toBe(undefined);
  });

  test('keeps the sort of a URL the form is reset to', () => {
    // going back to ?search=jazz&sort=updatedAt.desc re-initializes the form
    const { form } = renderSort({ options: ['score', 'updatedAt.desc'] });

    act(() => {
      form().initialize({ search: 'jazz', sort: 'updatedAt.desc' });
    });

    expect(form().getState().values.sort).toBe('updatedAt.desc');
  });

  test('leaves the sort alone on search when relevance is not offered', () => {
    const { change, form } = renderSort({ options: ['updatedAt.desc'] });

    change('sort', 'updatedAt.desc');
    change('search', 'concert');

    expect(form().getState().values.sort).toBe('updatedAt.desc');
  });
});

describe('sort widget', () => {
  test('passes its data-oa-widget-params on to the select', () => {
    const anchor = document.createElement('div');
    anchor.id = 'sort-widget';
    document.body.appendChild(anchor);

    render(
      <IntlProvider locale="en">
        <FiltersProvider
          filters={[]}
          widgets={[
            {
              name: 'sort',
              destSelector: '#sort-widget',
              options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
              label: 'Order the events',
              labels: {
                'lastTimingWithFeatured.asc': 'Chronological by last date',
              },
              shortLabels: { 'lastTimingWithFeatured.asc': 'Chronological' },
            },
          ]}
          onSubmit={() => {}}
        >
          <FiltersManager />
        </FiltersProvider>
      </IntlProvider>,
    );

    expect(
      within(anchor).getByRole('combobox', { name: 'Order the events' }),
    ).toBeTruthy();
    expect(within(anchor).getByText('Chronological')).toBeTruthy();

    anchor.remove();
  });
});
