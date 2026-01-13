import validateBySchema from '../client/src/iso/validateBySchema.js';

describe('validateBySchema', () => {
  describe('full input', () => {
    describe('schema with no access defined', () => {
      const schema = {
        fields: [
          {
            field: 'name',
            fieldType: 'text',
            label: 'Name',
          },
        ],
      };

      it('value is returned', () => {
        const clean = validateBySchema(schema, {
          name: 'René',
        });

        expect(clean).toStrictEqual({
          name: 'René',
        });
      });
    });

    describe('schema with write access defined', () => {
      const schema = {
        fields: [
          {
            field: 'id',
            fieldType: 'integer',
            label: 'Identifier',
            write: ['system'],
          },
          {
            field: 'name',
            fieldType: 'text',
            label: 'Name',
          },
        ],
      };

      it('exception is thrown if right access is not provided', () => {
        expect(() => {
          validateBySchema(
            schema,
            {
              id: 1,
            },
            {
              access: 'poster',
            },
          );
        }).toThrow();
      });

      it('value is returned if right access is provided', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 1,
          },
          {
            access: 'system',
          },
        );

        expect(clean).toStrictEqual({
          id: 1,
          name: undefined,
        });
      });

      it('value is filtered out if throwOnUnauthorized option is false', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 1,
            name: 'Émile',
          },
          {
            access: 'poster',
            throwOnUnauthorized: false,
          },
        );

        expect(clean).toStrictEqual({
          name: 'Émile',
        });
      });

      it('previous value is kept if is provided through stored key and access is not given', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 2,
          },
          {
            access: 'poster',
            throwOnUnauthorized: false,
            stored: { id: 1 },
          },
        );

        expect(clean).toStrictEqual({
          id: 1,
          name: undefined,
        });
      });

      it('authorization error is provided together with other validation errors', () => {
        let errors;
        try {
          validateBySchema(schema, {
            id: 3,
            name: { notAString: true },
          });
        } catch (e) {
          errors = e;
        }

        expect(errors).toStrictEqual([
          {
            field: 'id',
            code: 'unauthorized',
            message: 'not authorized to edit this field',
          },
          {
            origin: { notAString: true },
            code: 'string.invalidtype',
            message: 'not a string',
            field: 'name',
          },
        ]);
      });

      it('bypassAuthorization option to bypass authorization', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 2,
            name: 'Clément',
          },
          {
            bypassAuthorization: true,
          },
        );

        expect(clean).toStrictEqual({
          id: 2,
          name: 'Clément',
        });
      });
    });
  });

  describe('isPatch is true', () => {
    describe('schema with no access defined', () => {
      const schema = {
        fields: [
          {
            field: 'name',
            fieldType: 'text',
            label: 'Name',
          },
          {
            field: 'surname',
            fieldType: 'text',
            label: 'Surname',
          },
        ],
      };

      it('patch completes stored data', () => {
        const clean = validateBySchema(
          schema,
          {
            name: 'Terry',
          },
          {
            isPatch: true,
            stored: { name: 'T', surname: 'Pratchett' },
          },
        );

        expect(clean).toStrictEqual({ name: 'Terry', surname: 'Pratchett' });
      });
    });

    describe('schema with access defined', () => {
      const schema = {
        fields: [
          {
            field: 'id',
            write: ['system'],
            fieldType: 'integer',
            label: 'Identifier',
          },
          {
            field: 'name',
            fieldType: 'text',
            label: 'Name',
          },
          {
            field: 'surname',
            fieldType: 'text',
            label: 'Surname',
          },
        ],
      };

      it('returned data is completed with stored restricted access data if access is not provided', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 2,
            name: 'André',
          },
          {
            stored: {
              id: 1,
              name: 'Robert',
            },
            throwOnUnauthorized: false,
            access: 'editor',
            isPatch: true,
          },
        );

        expect(clean).toStrictEqual({
          id: 1,
          name: 'André',
          surname: undefined,
        });
      });

      it('if edit on restricted field is attempted, unauthorized error only is returned for that field', () => {
        let errors;
        try {
          validateBySchema(
            schema,
            {
              id: 'Three',
              name: 'Cunéguonde',
            },
            {
              isPatch: true,
              store: {
                id: 1,
                name: 'Isabelle',
              },
            },
          );
        } catch (e) {
          errors = e;
        }

        expect(errors).toStrictEqual([
          {
            field: 'id',
            code: 'unauthorized',
            message: 'not authorized to edit this field',
          },
        ]);
      });

      it('restricted access data can be patched with right access', () => {
        const clean = validateBySchema(
          schema,
          {
            id: 2,
            name: 'André',
          },
          {
            stored: {
              id: 1,
              name: 'Robert',
            },
            throwOnUnauthorized: false,
            access: 'system',
            isPatch: true,
          },
        );

        expect(clean).toStrictEqual({
          id: 2,
          name: 'André',
          surname: undefined,
        });
      });

      it('strictly validate input data with validateInputOnly option', () => {
        const clean = validateBySchema(
          schema,
          {
            name: 'André',
            notInSchema: true,
          },
          {
            stored: {
              surname: { value: 'Not a string' },
              notInSchema: false,
            },
            validateInputOnly: true,
          },
        );

        expect(clean).toStrictEqual({
          name: 'André',
          surname: { value: 'Not a string' },
        });
      });
    });
  });
});
