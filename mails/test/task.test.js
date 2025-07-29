import path from 'node:path';
import nodemailer from 'nodemailer';
import bullmq from 'bullmq';
import createMails from '../index.js';

const { jest } = import.meta;

const templatesDir = path.join(import.meta.dirname, '..', 'templates');

function _sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('task', () => {
  let mails;

  beforeAll(async () => {
    const account = await nodemailer.createTestAccount();

    const queue = new bullmq.Queue('mailsTest-task', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    });

    mails = await createMails({
      templatesDir,
      transport: {
        pool: true,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.user, // generated ethereal user
          pass: account.pass, // generated ethereal password
        },
        maxConnections: 5,
        maxMessages: Infinity,
        rateLimit: 1,
        rateDelta: 300,
      },
      defaults: {
        queue: true,
        data: {
          domain: 'https://openagenda.com',
        },
      },
      queue,
      createWorker: (processor) =>
        new bullmq.Worker(queue.name, processor, {
          connection: {
            host: 'localhost',
            port: 6379,
          },
          prefix: queue.opts.prefix,
          autorun: false,
          removeOnComplete: {
            age: 3600, // keep up to 1 hour
            count: 1000, // keep up to 1000 jobs
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // keep up to 7 days
            count: 1000, // keep up to 1000 jobs
          },
        }),
    });

    await queue.drain();

    mails.task();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await mails.worker.close();
  });

  it("send a mail with an error don't send anything", async () => {
    const spy = jest.spyOn(mails.config.transporter, 'sendMail');

    const { results, errors } = await mails.send({
      template: 'helloWorld',
      to: 'kevin.bertho@@gmail',
    });

    expect(spy.mock.calls).toHaveLength(0);
    expect(results).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });

  it('send text email', async () => {
    const spy = jest.spyOn(mails.config.transporter, 'sendMail');

    const { results, errors } = await mails.send({
      to: 'example@gmail.com',
      subject: 'Nouvel inscrit',
      text: 'On a un nouvel inscrit !',
    });

    expect(results).toHaveLength(1);
    expect(errors).toHaveLength(0);

    const wait = async () => {
      if (spy.mock.calls.length === 1) {
        return;
      }

      await _sleep(50);

      return wait();
    };

    await wait();

    expect(spy).toHaveBeenCalledWith({
      to: { address: 'example@gmail.com', name: '' },
      subject: 'Nouvel inscrit',
      text: 'On a un nouvel inscrit !',
      data: { domain: 'https://openagenda.com' },
      html: null,
    });
  });
});
