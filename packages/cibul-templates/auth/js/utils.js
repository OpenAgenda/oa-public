import VError from '@openagenda/verror';

export function getTypeFromClass(classes) {
  return classes.includes('has-error') ? 'error' : null;
}

export function getClassesFromType(type) {
  if (type === 'warning') {
    return {
      group: 'from-group has-warning',
      sub: 'text-warning',
    };
  }

  if (type === 'error') {
    return {
      group: 'form-group has-error',
      sub: 'text-danger',
    };
  }

  return {
    group: 'form-group',
    sub: '',
  };
}

export async function testPostEvaluate(password) {
  await new Promise(rs => setTimeout(rs, 2000));
  if (!password?.length) {
    return {
      message: {
        type: 'error',
        code: 'required',
      },
    };
  }
  if (password.length < 3) {
    return {
      message: {
        type: 'error',
        code: 'tooWeak',
      }
    };
  }
  if (password.length < 6) {
    return {
      message: {
        type: 'warning',
        code: 'weak',
      },
    };
  }

  return {
    message: {
      type: 'ok',
      code: password.length > 10 ? 'great' : 'good',
    },
  };
}

export async function postEvaluate(res, password) {
  const response = await fetch(res, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password })
  });

  if (response.ok) return response.json();

  throw new VError[response.status](response.statusText);
}