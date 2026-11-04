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

// what the closed select shows
const shownValue = (root = document.body) =>
  root.querySelector('[class*="singleValue"]')?.textContent;

// the labels the select is sized to
const sizingLabels = (container) =>
  [
    ...container.querySelectorAll(
      'span[aria-hidden][style*="visibility: hidden"]',
    ),
  ].map((el) => el.textContent);

// the label of each menu option, without its detail line
const optionLabels = (container) =>
  [...container.querySelectorAll('[id*="-option-"]')].map(
    (el) =>
      el.querySelector('.oa-filters-sort-label')?.textContent ?? el.textContent,
  );

describe('Sort', () => {
  test('shows the select with a single choice, as the defaults are without a search', () => {
    const { container, openMenu } = renderSort();

    openMenu();

    expect(optionLabels(container)).toEqual([
      'Featured first, chronological (last date)',
    ]);
  });

  test('sizes the select to every label it can show, relevance included', () => {
    const { container, change } = renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc', 'score'],
      shortLabels: { 'updatedAt.desc': 'Latest' },
    });
    const expected = ['Chronological', 'Latest', 'Relevance'];

    expect(sizingLabels(container)).toEqual(expected);

    change('search', 'concert');
    change('sort', 'updatedAt.desc');

    expect(sizingLabels(container)).toEqual(expected);
  });

  test('keeps a sort it does not offer in the sizing once shown', () => {
    const { container, change } = renderSort({}, { sort: 'updatedAt.asc' });

    expect(shownValue()).toBe('Oldest updates');
    expect(sizingLabels(container)).toEqual([
      'Chronological',
      'Relevance',
      'Oldest updates',
    ]);

    change('sort', 'lastTimingWithFeatured.asc');

    expect(sizingLabels(container)).toEqual([
      'Chronological',
      'Relevance',
      'Oldest updates',
    ]);
  });

  test('keeps its sizing when the page passes its own components', () => {
    const DropdownIndicator = () => <span className="page-indicator" />;
    const { container } = renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      components: { DropdownIndicator },
    });

    expect(container.querySelector('.page-indicator')).toBeTruthy();
    expect(sizingLabels(container)).toEqual([
      'Chronological',
      'Recently updated',
    ]);
  });

  test('follows the selected label with sizeToLabels false', () => {
    const { container } = renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      sizeToLabels: false,
    });

    expect(shownValue()).toBe('Chronological');
    expect(sizingLabels(container)).toEqual([]);
  });

  test('stays in place, named and disabled, with nothing to offer', () => {
    const { container } = renderSort({ options: ['score'] });

    expect(container.textContent).toContain('Sort by');
    expect(container.textContent).not.toContain('Select...');
    expect(container.querySelector('input').disabled).toBe(true);
    // named once: the placeholder is not its description too
    const input = container.querySelector('input');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    describedBy
      .split(' ')
      .filter(Boolean)
      .forEach((id) => {
        expect(document.getElementById(id)?.textContent).not.toBe('Sort by');
      });
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
      options: ['timings.asc', 'updatedAt.asc', 'score'],
      defaultValue: 'updatedAt.desc',
    });

    expect(shownValue()).toBe('Chronological');
  });

  test('shows the sort of the initial query', () => {
    renderSort(
      { options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'] },
      { sort: 'updatedAt.desc' },
    );

    expect(shownValue()).toBe('Recently updated');
  });

  test('names an initial sort the select does not offer', () => {
    renderSort(
      { options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'] },
      { sort: 'timings.asc' },
    );

    expect(shownValue()).toBe('Chronological');
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
      options: ['updatedAt.desc', 'timings.asc'],
      descriptions: false,
    });

    openMenu();

    expect(container.querySelector('.oa-filters-sort-description')).toBeNull();
  });

  test('shows the short label in the closed select, the label in the menu', () => {
    const { container, openMenu } = renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      labels: { 'lastTimingWithFeatured.asc': 'Chronological by last date' },
      shortLabels: { 'lastTimingWithFeatured.asc': 'Chronological' },
    });

    expect(shownValue()).toBe('Chronological');

    openMenu();

    expect(optionLabels(container)).toEqual([
      'Chronological by last date',
      'Recently updated',
    ]);
  });

  test('names the select "Sort by" by default', () => {
    renderSort({ options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'] });

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeTruthy();
  });

  test('takes another accessible name', () => {
    renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      label: 'Order the events',
    });
    expect(
      screen.getByRole('combobox', { name: 'Order the events' }),
    ).toBeTruthy();
  });

  test('leaves the name to an outside <label> when label is false', () => {
    const { container } = renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      label: false,
    });

    expect(container.querySelector('input').getAttribute('aria-label')).toBe(
      null,
    );
  });

  test("prefers the integration's label over the default short one", () => {
    renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      labels: { 'lastTimingWithFeatured.asc': 'Public view' },
    });

    expect(shownValue()).toBe('Public view');
  });

  test('takes label overrides', () => {
    renderSort({
      options: ['lastTimingWithFeatured.asc', 'updatedAt.desc'],
      labels: { 'lastTimingWithFeatured.asc': 'Public view' },
    });

    expect(shownValue()).toBe('Public view');
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
    expect(shownValue(anchor)).toBe('Chronological');

    anchor.remove();
  });
});
