import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from './lib/labels';
import OptionLabelsForm from './OptionLabelsForm';
import OptionItem from './OptionItem';

const getLabel = makeLabelGetter(labels);

const modes = {
  ADDING: 0,
  EDITING: 1,
  ORDERING: 2
};

export default class OptionsField extends Component {
  constructor(props) {
    super(props);

    const state = {
      mode: null,
      editedIndex: null
    };

    if (props.field.devInitState) _.assign(state, props.field.devInitState);

    this.state = state;
  }

  onDragEnd({ source, destination }) {
    const {
      onChange
    } = this.props;

    if (!destination) return;

    const options = this.getOptions();
    const forward = source.index < destination.index;

    onChange(ih(options, {
      $splice: [
        [destination.index + (forward ? 1 : 0), 0, options[source.index]],
        [source.index + (forward ? 0 : 1), 1]
      ]
    }));
  }

  setMode(newMode) {
    this.setState({ mode: newMode });
  }

  getOptions() {
    const {
      value
    } = this.props;
    return value || [];
  }

  addOption(newOption) {
    const {
      onChange
    } = this.props;

    onChange((this.getOptions()).concat(newOption));
  }

  editOption(index) {
    this.setState({ mode: modes.EDITING, editedIndex: index });
  }

  removeOption(index) {
    const {
      onChange
    } = this.props;
    onChange(ih(this.getOptions(), { $splice: [[index, 1]] }));
  }

  updateOption(index, option) {
    const {
      onChange
    } = this.props;

    const options = this.getOptions();

    const optionWithId = _.assign({ id: options[index].id }, option);

    onChange(_.set(options, index, optionWithId));

    this.setState({ mode: null });
  }

  isOptionActionable() {
    const {
      mode
    } = this.state;

    return ![modes.EDITING, modes.ORDERING].includes(mode);
  }

  isOrderingDisabled() {
    const {
      mode
    } = this.state;

    if (mode === modes.EDITING) return true;

    if (this.getOptions().length < 2) return true;
  }

  isOptionDisabled(index) {
    const {
      mode,
      editedIndex
    } = this.state;

    if (mode === modes.ADDING) return false;

    if ((mode === modes.EDITING) && (index !== editedIndex)) return true;

    return false;
  }

  renderOrder() {
    const {
      lang
    } = this.props;

    const {
      mode
    } = this.state;

    if (mode !== modes.ORDERING) {
      return (
        <button
          type="button"
          onClick={this.setMode.bind(this, modes.ORDERING)}
          className="btn btn-primary order-action"
          disabled={this.isOrderingDisabled()}
        >
          {getLabel('optionOrder', lang)}
        </button>
      );
    }

    return (
      <div className="text-center">
        <p className="margin-top-md">{getLabel('orderInstruction', lang)}</p>
        <button
          type="button"
          onClick={() => this.setMode(null)}
          className="btn btn-primary margin-top-sm"
        >
          {getLabel('optionOrderEndAction', lang)}
        </button>
      </div>
    );
  }

  renderAdd() {
    const { field, lang } = this.props;

    const { mode } = this.state;

    if (![modes.ADDING, modes.ORDERING].includes(mode)) {
      return (
        <button
          type="button"
          disabled={mode !== null}
          className="btn btn-primary margin-top-md"
          onClick={this.setMode.bind(this, modes.ADDING)}
        >
          {getLabel('optionAdd', lang)}
        </button>
      );
    }

    if (mode === modes.ADDING) {
      return (
        <div className="margin-top-md">
          <OptionLabelsForm
            otherOptions={this.getOptions()}
            onSubmit={(i, o) => this.addOption(o)}
            lang={lang}
            languages={_.isArray(field.labelLanguages) && field.labelLanguages.length ? field.labelLanguages : null}
          />
        </div>
      );
    }
  }

  renderDraggableOptions() {
    const { field, value, lang } = this.props;
    const {
      mode,
      editedIndex
    } = this.state;

    return (
      <DragDropContext
        onDragEnd={values => this.onDragEnd(values)}
      >
        <Droppable droppableId="droppable-options">
          {(provided, snapshot) => (
            <ul
              ref={provided.innerRef}
              style={snapshot.isDraggingOver ? { background: '#f9f9f9' } : {}}
              className="list-group margin-v-sm"
            >
              {this.getOptions().map((option, index) => (
                <Draggable
                  index={index}
                  isDragDisabled={mode !== modes.ORDERING}
                  draggableId={option.value}
                  key={option.value}
                >
                  {(oProvided, oSnapshot) => (
                    <OptionItem
                      lang={lang}
                      field={field}
                      option={option}
                      otherOptions={value.filter((o, i) => i !== index)}
                      index={index}
                      isEdited={(mode === modes.EDITING) && (index === editedIndex)}
                      actionable={this.isOptionActionable()}
                      disabled={this.isOptionDisabled(index)}
                      onEdit={i => this.editOption(i)}
                      onEditCancel={() => this.setState({ mode: null })}
                      onRemove={i => this.removeOption(i)}
                      onUpdate={(i, o) => this.updateOption(i, o)}
                      provided={oProvided}
                      snapshot={oSnapshot}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  render() {
    const {
      lang
    } = this.props;

    return (
      <div className="options-field-form">
        {this.getOptions().length ? this.renderDraggableOptions() : <div className="margin-top-md margin-bottom-sm text-center">{getLabel('emptyOptions', lang)}</div> }
        {this.renderAdd()}
        {this.renderOrder()}
      </div>
    );
  }
}
