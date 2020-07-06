/*
 * verror.js: richer JavaScript errors
 */

import AssertionError from 'assertion-error';
import { isError, isObject, isFunc, isString } from './assert';
import parseConstructorArguments from './parseConstructorArguments';

/*
 * See README.md for reference documentation.
 */
class VError extends Error {
  static cause(err) {
    if (!isError(err)) throw new AssertionError('err must be an Error');

    return isError(err.jse_cause) ? err.jse_cause : null;
  };

  static info(err) {
    if (!isError(err)) throw new AssertionError('err must be an Error');

    const cause = VError.cause(err);
    const rv = cause !== null ? VError.info(cause) : {};

    if (typeof err.jse_info === 'object' && err.jse_info !== null) {
      for (const k in err.jse_info) {
        if (Object.prototype.hasOwnProperty.call(err.jse_info, k)) {
          rv[k] = err.jse_info[k];
        }
      }
    }

    return rv;
  };

  static findCauseByName(err, name) {
    if (!isError(err)) throw new AssertionError('err must be an Error');
    if (!isString(name)) throw new AssertionError('name (string) is required');
    if (name.length <= 0) throw new AssertionError('name cannot be empty');

    for (let cause = err; cause !== null; cause = VError.cause(cause)) {
      if (!isError(err)) throw new AssertionError('cause must be an Error');

      if (cause.name === name) {
        return cause;
      }
    }

    return null;
  };

  static findCauseByType(err, type) {
    if (!isError(err)) throw new AssertionError('err must be an Error');
    if (!isFunc(type)) throw new AssertionError('type (func) is required');

    for (let cause = err; cause !== null; cause = VError.cause(cause)) {
      if (!isError(err)) throw new AssertionError('cause must be an Error');

      if (cause instanceof type) {
        return cause;
      }
    }

    return null;
  }

  static hasCauseWithName(err, name) {
    return VError.findCauseByName(err, name) !== null;
  }

  static hasCauseWithType(err, type) {
    return VError.findCauseByType(err, type) !== null;
  }

  static fullStack(err) {
    if (!isError(err)) throw new AssertionError('err must be an Error');

    const cause = VError.cause(err);

    if (cause) {
      return `${err.stack}\ncaused by: ${VError.fullStack(cause)}`;
    }

    return err.stack;
  };

  static errorFromList(errors) {
    if (!Array.isArray(errors)) {
      throw new AssertionError('list of errors (array) is required');
    }

    errors.forEach(function (error) {
      if (!isObject(error)) {
        throw new AssertionError('errors ([object]) is required');
      }
    });

    if (errors.length === 0) {
      return null;
    }

    errors.forEach((e) => {
      if (!isError(e)) throw new AssertionError('error must be an Error');
    });

    if (errors.length === 1) {
      return errors[0];
    }

    return new MultiError(errors);
  };

  static errorForEach(err, func) {
    if (!isError(err)) throw new AssertionError('err must be an Error');
    if (!isFunc(func)) throw new AssertionError('func (func) is required');

    if (err instanceof MultiError) {
      err.errors().forEach((e) => {
        func(e);
      });
    } else {
      func(err);
    }
  };

  constructor(...args) {
    /*
     * For convenience and backwards compatibility, we support several
     * different calling forms. Normalize them here.
     */
    const { options, shortmessage } = parseConstructorArguments(...args);
    const { cause } = options;
    let message = shortmessage;

    /*
     * If we've been given a cause, record a reference to it and update our
     * message appropriately.
     */
    if (cause) {
      if (!isError(cause)) throw new AssertionError('cause must be an Error');

      if (!options.skipCauseMessage && cause.message) {
        message = message === ''
          ? cause.message
          : `${message}: ${cause.message}`;
      }
    }

    super(message);

    this.message = message;

    /*
     * If we've been given a name, apply it now.
     */
    if (options.name) {
      if (!isString(options.name))
        throw new AssertionError('error\'s "name" must be a string');
      this.name = options.name;
    }

    /*
     * For debugging, we keep track of the original short message (attached
     * this Error particularly) separately from the complete message (which
     * includes the messages of our cause chain).
     */
    this.jse_shortmsg = shortmessage;

    if (cause) {
      this.jse_cause = cause;
    }

    /*
     * If we've been given an object with properties, shallow-copy that
     * here.  We don't want to use a deep copy in case there are non-plain
     * objects here, but we don't want to use the original object in case
     * the caller modifies it later.
     */
    this.jse_info = {};

    if (options.info) {
      for (const k in options.info) {
        if (Object.prototype.hasOwnProperty.call(options.info, k)) {
          this.jse_info[k] = options.info[k];
        }
      }
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, options.constructorOpt || this.constructor);
    }
  }

  toString() {
    let str =
      (Object.prototype.hasOwnProperty.call(this, 'name') && this.name) ||
      this.constructor.name ||
      this.constructor.prototype.name;

    if (this.message) {
      str += `: ${this.message}`;
    }

    return str;
  }
}

VError.prototype.name = 'VError';

/*
 * Represents a collection of errors for the purpose of consumers that generally
 * only deal with one error.  Callers can extract the individual errors
 * contained in this object, but may also just treat it as a normal single
 * error, in which case a summary message will be printed.
 */
class MultiError extends VError {
  constructor(errors) {
    if (!Array.isArray(errors)) {
      throw new AssertionError('list of errors (array) is required');
    }
    if (errors.length <= 0) {
      throw new AssertionError('must be at least one error is required');
    }

    super(
      {
        cause: errors[0],
      },
      'first of %d error%s',
      errors.length,
      errors.length === 1 ? '' : 's'
    );

    this.ase_errors = errors;
  }

  errors() {
    return this.ase_errors.slice(0);
  }
}

MultiError.prototype.name = 'MultiError';

/*
 * See README.md for reference details.
 */
class WError extends VError {
  constructor(...args) {
    const { options, shortmessage } = parseConstructorArguments(...args);

    options.skipCauseMessage = true;

    super(options, '%s', shortmessage);
  }

  toString() {
    let str =
      (Object.prototype.hasOwnProperty.call(this, 'name') && this.name) ||
      this.constructor.name ||
      this.constructor.prototype.name;

    if (this.message) {
      str += `: ${this.message}`;
    }
    if (this.jse_cause && this.jse_cause.message) {
      str += `; caused by ${this.jse_cause.toString()}`;
    }

    return str;
  }
}

WError.prototype.name = 'WError';

export default VError;

export {
  VError,
  WError,
  MultiError
};

/*
 * Usage:
 *
 * import VError from '@openagenda/verror';     // VError.cause ✓
 * import { VError } from '@openagenda/verror'; // VError.cause ✓
 * import * as VError from '@openagenda/verror' // VError.cause ✓
 * import { cause } from '@openagenda/verror';  // cause        ✓
 */
