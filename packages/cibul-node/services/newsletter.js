import VError from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('services/newsletter');

async function newSubscriber(crispWebsiteId, token, { email, user }) {
  const response = await fetch(
    `https://api.crisp.chat/v1/website/${crispWebsiteId}/people/profile`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
        'X-Crisp-Tier': 'plugin',
      },
      body: JSON.stringify({
        email,
        person: {
          nickname: user?.fullName || email,
        },
        segments: ['newsletter', ...user ? ['inscrits'] : []],
      }),
    },
  );

  // if (!response.ok) {
  //   throw new Error('Can\'t add subscriber');
  // }

  return response.json();
}

async function updateSubscriber(crispWebsiteId, token, email) {
  const response = await fetch(
    `https://api.crisp.chat/v1/website/${crispWebsiteId}/people/profile/${email}`,
    {
      headers: {
        Authorization: `Basic ${token}`,
        'X-Crisp-Tier': 'plugin',
      },
    },
  );

  if (!response.ok) {
    throw new Error("Can't update subscriber");
  }

  const profile = await response.json();

  if (profile.error) {
    throw new VError("Can't get profile", {
      info: {
        email,
        error: profile.error,
        data: profile.data,
      },
    });
  }

  // Already subscribed
  if (profile.data.segments.includes('newsletter')) {
    return;
  }

  const peopleId = profile.data.people_id;

  const response1 = await fetch(
    `https://api.crisp.chat/v1/website/${crispWebsiteId}/people/profile/${peopleId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
        'X-Crisp-Tier': 'plugin',
      },
      body: JSON.stringify({
        segments: [...profile.data.segments, 'newsletter'],
      }),
    },
  );

  if (!response1.ok) {
    throw new Error("Can't update subscriber");
  }

  const result = await response1.json();

  if (result.error) {
    throw new VError("Can't update profile", {
      info: {
        email,
        error: result.error,
        data: result.data,
      },
    });
  }

  return result;
}

export function init(config, services) {
  const {
    crisp: crispWebsiteId,
    newsletter: { crispIdentifier, crispKey },
  } = config;

  const token = Buffer.from(`${crispIdentifier}:${crispKey}`).toString(
    'base64',
  );

  return {
    async addSubscriber(email) {
      const user = await services.users.findOne({
        query: {
          email,
        },
      });

      try {
        const result = await newSubscriber(crispWebsiteId, token, {
          email,
          user,
        });

        if (result?.error) {
          if (result.reason === 'people_exists') {
            // just add 'newsletter' segment
            await updateSubscriber(crispWebsiteId, token, email);
            return;
          }
          throw new VError('Cannot add email to newsletter list', {
            info: {
              email,
              reason: result.reason,
              data: result.data,
            },
          });
        }
      } catch (e) {
        log.error("Can't subscribe to the newsletter", e);
      }
    },
  };
}
