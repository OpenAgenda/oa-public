import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import validators from '@openagenda/validators';

const { text, email, pass, number } = validators;

let config;
let knex;

schema.register({
  text,
  email,
  pass,
  number,
});

class Invitation {
  constructor(data) {
    data.store = JSON.parse(data.store || '{}');
    this._data = data;
  }

  get id() {
    return this._data.id;
  }

  get email() {
    return this._data.email;
  }

  set email(value) {
    this._data.email = value;
  }

  get token() {
    return this._data.token;
  }

  get data() {
    return this._data.store;
  }

  addAction(name, params) {
    const { store } = this._data;

    if (!store.actions) store.actions = [];

    if (!_.get(config.actions, name)) {
      return Promise.resolve({
        errors: [
          {
            code: 'action.notFound',
            message: 'action not found in config',
            origin: name,
          },
        ],
      });
    }

    const id = (store.nextId += 1) || 1;
    store.nextId = id;
    const action = {
      id,
      name,
      params: [].concat(params),
    };

    store.actions.push(action);

    try {
      Invitation.validate(this._data);
    } catch (e) {
      store.actions.pop();
      return Promise.resolve({ errors: e });
    }

    return this.save().then(
      () =>
        new Promise((resolve, reject) => {
          config.interfaces.onAssign(action, this, (err) =>
            (err ? reject(err) : resolve(this)));
        }),
    );
  }

  removeAction(id) {
    const { store } = this._data;

    if (!store.actions) store.actions = [];

    store.actions = store.actions.filter((action) => action.id !== id);

    return this.save().then(() => this);
  }

  execute(data) {
    const { store } = this._data;

    if (!store.actions) store.actions = [];

    return (async () => {
      const results = [];
      const errors = [];

      for (const item of store.actions) {
        const action = _.get(config.actions, item.name);

        if (!action) {
          errors.push({
            name: item.name,
            code: 'action.notExists',
            message: 'action is not found in config',
          });
          results.push(null);
          continue;
        }

        const result = await new Promise((resolve, reject) => {
          action(data, [].concat(item.params), (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });
        results.push(result);
      }

      await knex(config.schemas.invitation)
        .where({ id: this.id })
        .update({ processedAt: new Date() });

      return { results, errors };
    })();
  }

  remove() {
    return knex(config.schemas.invitation).where({ id: this.id }).del();
  }

  save() {
    return knex(config.schemas.invitation)
      .where({ id: this.id })
      .update({
        store: JSON.stringify(this.data),
        email: this.email,
        token: this.token,
      });
  }
}

Invitation.init = (c, k) => {
  config = c;
  knex = k;
};

Invitation.validate = schema({
  email: {
    type: 'email',
    optional: false,
  },
  token: {
    type: 'text',
    optional: false,
  },
  store: {
    fields: {
      nextId: {
        type: 'number',
      },
      actions: {
        list: true,
        fields: {
          name: {
            type: 'text',
            optional: false,
          },
          params: {
            type: 'pass',
            list: true,
          },
        },
      },
    },
  },
});

export default Invitation;
