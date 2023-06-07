export class NoThrownError extends Error {
  message = 'No error thrown';
}

export default async function getError(call) {
  try {
    await call();

    throw new NoThrownError();
  } catch (error) {
    if (error instanceof NoThrownError) {
      throw error;
    }

    return error;
  }
}
