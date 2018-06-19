The FormSchemaComponent can generate a form when given a form-schema.

The event form needs more complex components: timings picker, location sub-form

The FormSchemaComponent could be extensible if given the proper components matching different types: 'location', 'timings'

Data flows must be normalized, so a transform component may be required for specific event form types to function with a standard FormSchemaComponent.

Additional types&components can be passed through the FSC props

1. Create a dev environment for the FSC in form-schemas

2. Make FSC extensible

 * extension: timings type
 * extension: locations type
 * extension: image
 * extension: accessibilité particulière
 * extension: age du public ciblés

3. Have FSC Work in Create/Edit modes

4. Assemble first event form -> post data to ... tweaked v2 api endpoints. The event-form repo does not need a 'service'. The event form is a component only



Images... posted with the rest of the data