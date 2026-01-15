import validate from '../lib/validate.js';
import compileForValidation from '../lib/compileForValidation.js';

describe('validate', () => {
  describe('miscellaneous', () => {
    it('location needs to be specified if attendanceMode is offline', async () => {
      let error;
      try {
        await validate({
          attendanceMode: 1,
        });

        throw new Error('should not reach here');
      } catch (e) {
        error = e;
      }
      expect(
        error.info.errors.filter((e) => e.field === 'locationUid').pop().code,
      ).toBe('required');
    });

    it('long descriptions with multicaractered single accented letters is cleaned up', async () => {
      const longDescription = {
        fr: 'À côté',
      };
      const clean = await validate(
        {
          longDescription,
        },
        { isDraft: 1 },
      );

      expect(longDescription.fr.length).toBe(9);
      expect(clean.longDescription.fr.length).toBe(6);
    });

    it('onlineAccessLink is removed from clean values when attendanceMode is offline', async () => {
      const event = await validate({
        attendanceMode: 1,
        locationUid: 1,
        title: 'Un titre',
        description: 'Une description',
        timings: [
          {
            begin: '2021-01-28T16:00:00.000Z',
            end: '2021-01-28T20:00:00.000Z',
          },
        ],
        onlineAccessLink: 'https://removed.link.fr',
      });

      expect(event.onlineAccessLink).toBeNull();
    });

    it('draft event does not need to be complete to be valid', async () => {
      const clean = await validate(
        {
          attendanceMode: 1,
        },
        { isDraft: 1 },
      );

      expect(clean.attendanceMode).toBe(1);
    });

    it('location needs to be specified if attendanceMode is mixed', async () => {
      let error;
      try {
        await validate({
          attendanceMode: 3,
        });

        throw new Error('should not reach here');
      } catch (e) {
        error = e;
      }

      expect(
        error.info.errors.filter((e) => e.field === 'locationUid').pop().code,
      ).toBe('required');
    });

    it('location does not need to be specified iff attendanceMode is online', async () => {
      let error;
      try {
        await validate({
          attendanceMode: 2,
        });
      } catch (e) {
        error = e;
      }

      expect(
        error.info.errors.filter((e) => e.field === 'locationUid').length,
      ).toBe(0);
    });

    it('status is converted when provided as a slug', async () => {
      const clean = await validate(
        {
          status: 'movedOnline',
        },
        { isDraft: true },
      );

      expect(clean.status).toBe(3);
    });

    it('age should be an object with min and max values', async () => {
      const clean = await validate(
        {
          age: { min: 12, max: 100 },
        },
        { isDraft: true },
      );

      expect(clean.age).toEqual({
        min: 12,
        max: 100,
      });
    });

    it('legacy: if image is provided as an object that includes null filename, it is considered as null image', async () => {
      const clean = await validate(
        {
          image: {
            extension: null,
            originalName: null,
            filename: null,
            credits: null,
            variants: undefined,
            size: undefined,
          },
        },
        { isDraft: true },
      );

      expect(clean.image).toBeNull();
    });

    it('complete online event needs at least a title, description, attendanceMode, timings and a onlineAccessLink', async () => {
      expect(
        await validate({
          title: 'Un événement',
          description: 'Une description',
          attendanceMode: 2,
          onlineAccessLink: 'https://wheretheeventtakesplace.com',
          timings: [
            {
              begin: '2020-11-30T08:00:00.000Z',
              end: '2020-11-30T10:00:00.000Z',
            },
          ],
        }),
      ).toBeTruthy();
    });

    it('unspecified age is a null min and null max', async () => {
      expect(
        (
          await validate({
            title: 'Un événement',
            description: 'Une description',
            attendanceMode: 2,
            onlineAccessLink: 'https://wheretheeventtakesplace.com',
            timings: [
              {
                begin: '2020-11-30T08:00:00.000Z',
                end: '2020-11-30T10:00:00.000Z',
              },
            ],
          })
        ).age,
      ).toEqual({
        min: null,
        max: null,
      });
    });

    it('complete mixed event needs a location and a onlineAccessLink', async () => {
      let error;
      try {
        await validate({
          title: 'Un événement',
          description: 'Une description',
          attendanceMode: 3,
          timings: [
            {
              begin: '2020-11-30T08:00:00.000Z',
              end: '2020-11-30T10:00:00.000Z',
            },
          ],
        });
      } catch (e) {
        error = e;
      }
      expect(error.info.errors.map((e) => e.field)).toEqual([
        'onlineAccessLink',
        'locationUid',
      ]);
    });

    it('validate extIds', async () => {
      const extIds = [
        { key: 'extId1', value: '123' },
        { key: 'extId2', value: '456' },
      ];
      const clean = await validate(
        {
          extIds,
        },
        { isDraft: true },
      );

      expect(clean.extIds).toEqual(extIds);
    });
  });

  describe('timings and timezone', () => {
    test('timings passed as strings takes timezone value into account', async () => {
      const { timings } = await validate(
        {
          timings: [
            {
              begin: '2025-11-04T12:00:00',
              end: '2025-11-04T14:00:00',
            },
          ],
          timezone: 'America/New_York',
        },
        { isDraft: true },
      );

      expect(timings).toEqual([
        {
          begin: new Date('2025-11-04T17:00:00.000Z'),
          end: new Date('2025-11-04T19:00:00.000Z'),
        },
      ]);
    });
  });

  describe('registration', () => {
    it('if registration data is provided as a list of strings, it is converted into a list of { type, value } objects', async () => {
      const { registration } = await validate(
        {
          registration: ['an@email.com'],
        },
        { isDraft: true },
      );

      expect(registration).toEqual([
        {
          type: 'email',
          value: 'an@email.com',
        },
      ]);
    });

    it('invalid data throws validation error', async () => {
      let error;
      try {
        await validate({
          registration: ['notAPhoneNotAnEmailAndNotALink'],
        });
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('ValidationError');
      expect(
        error.info.errors.find((e) => e.field === 'registration').code,
      ).toBe('registration.invalid');
    });

    it('registration data can be provided as list of objects', async () => {
      const { registration } = await validate(
        {
          registration: [{ type: 'email', value: 'an@email.com' }],
        },
        { isDraft: true },
      );

      expect(registration).toEqual([
        {
          type: 'email',
          value: 'an@email.com',
        },
      ]);
    });

    it('passData maintained', async () => {
      const { compiled } = await compileForValidation(
        {
          registration: [
            {
              service: 'passCulture',
              data: 'someData',
              value: 'www.passlink.com',
            },
          ],
        },
        {
          registration: ['www.passlink.com', 'someotherlink.com'],
        },
      );
      expect(compiled.registration).toStrictEqual([
        {
          service: 'passCulture',
          data: 'someData',
          value: 'www.passlink.com',
        },
        'someotherlink.com',
      ]);
    });
  });

  describe('languages', () => {
    it('title can be specified in one language', async () => {
      let titleErrors;
      try {
        await validate({
          title: 'A title',
        });
      } catch (error) {
        titleErrors = error.info.errors.filter((e) => e.field === 'title');
      }

      expect(titleErrors.length).toBe(0);
    });

    it('language codes need to be two alphanumerical characters', async () => {
      let error;
      try {
        await validate(
          {
            title: { '"fr"': 'Un code langue mal formaté' },
          },
          { isDraft: true },
        );
      } catch (e) {
        error = e;
      }
      expect(error.info.errors[0].code).toEqual('lang.invalid');
    });
  });

  it('maintain passData work with list of obj', async () => {
    const { compiled } = await compileForValidation(
      {
        registration: [
          {
            service: 'passCulture',
            data: 'someData',
            value: 'www.passlink.com',
          },
        ],
      },
      {
        registration: [
          { value: 'www.passlink.com' },
          { value: 'someotherlink.com' },
        ],
      },
    );
    expect(compiled.registration).toStrictEqual([
      {
        service: 'passCulture',
        data: 'someData',
        value: 'www.passlink.com',
      },
      { value: 'someotherlink.com' },
    ]);
  });
});
