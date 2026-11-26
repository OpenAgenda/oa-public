// `jobOptions` reach the queue and nothing else. A caller pacing its sends
// (see the inactive-account campaign in cibul-node) depends on both halves:
// the `delay` has to be given to BullMQ, and it must NOT travel in the job
// payload — unknown top-level keys of a message reach the transport's
// payload, so a stray `jobOptions` would be handed to the provider.
import path from 'node:path';
import createMails from '../index.js';

const templatesDir = path.join(import.meta.dirname, '..', 'templates');

function stubQueue() {
  const added = [];
  return {
    added,
    add: async (name, data, opts) => {
      added.push({ name, data, opts });
      return { id: String(added.length) };
    },
  };
}

describe('send jobOptions', () => {
  it('hands them to queue.add and keeps them out of the payload', async () => {
    const queue = stubQueue();
    const mails = await createMails({
      templatesDir,
      transport: { jsonTransport: true },
      queue,
      createWorker: () => {},
      defaults: { queue: true, data: { domain: 'https://openagenda.com' } },
    });

    const { errors } = await mails.send({
      template: 'helloWorld',
      data: { username: 'bertho' },
      to: 'user@example.com',
      jobOptions: { delay: 1800000 },
    });

    expect(errors).toHaveLength(0);
    expect(queue.added).toHaveLength(1);

    const [job] = queue.added;

    expect(job.name).toBe('prepareMail');
    expect(job.opts).toEqual({ delay: 1800000 });
    expect('jobOptions' in job.data).toBe(false);
  });

  it('enqueues without options when none are given', async () => {
    const queue = stubQueue();
    const mails = await createMails({
      templatesDir,
      transport: { jsonTransport: true },
      queue,
      createWorker: () => {},
      defaults: { queue: true, data: { domain: 'https://openagenda.com' } },
    });

    await mails.send({
      template: 'helloWorld',
      data: { username: 'bertho' },
      to: 'user@example.com',
    });

    expect(queue.added).toHaveLength(1);
    expect(queue.added[0].opts).toBe(undefined);
  });

  it('sends on the spot when no queue is configured at all', async () => {
    // `createConfig` sets neither `queue` nor `defaults.queue`, so a consumer
    // that configures no queue and does not ask for `queue: false` gets
    // `enqueue` true. Branching on that alone read `add` off `undefined`: it
    // threw for every recipient, the throw was caught, and `send()` resolved
    // with a full `errors` array and nothing sent.
    const mails = await createMails({
      templatesDir,
      transport: { jsonTransport: true },
      defaults: { data: { domain: 'https://openagenda.com' } },
    });

    const { results, errors } = await mails.send({
      template: 'helloWorld',
      data: { username: 'bertho' },
      to: 'user@example.com',
    });

    expect(errors).toHaveLength(0);
    expect(results).toHaveLength(1);
    expect(JSON.parse(results[0].message).subject).toBeTruthy();
  });

  it('ignores them on the unqueued path', async () => {
    const queue = stubQueue();
    const mails = await createMails({
      templatesDir,
      transport: { jsonTransport: true },
      queue,
      createWorker: () => {},
      defaults: { queue: true, data: { domain: 'https://openagenda.com' } },
    });

    const { results, errors } = await mails.send({
      template: 'helloWorld',
      data: { username: 'bertho' },
      to: 'user@example.com',
      queue: false,
      jobOptions: { delay: 1800000 },
    });

    expect(errors).toHaveLength(0);
    expect(queue.added).toHaveLength(0);
    expect(JSON.parse(results[0].message).jobOptions).toBe(undefined);
  });
});
