
Formulaire de configuration d'un champ custom
notreChampCustom
```
[{
  label: 'Label',
  field: 'label',
  fieldType: 'text'
}, {
  field: 'optional',
  fieldType: 'boolean'
}, {
  field: 'info',
  label: 'Texte d\'information'
  fieldType: 'text'
}, {
  field: 'someCustomParam1',
  fieldType: 'someCustomParamType'
}, {
  field: 'someCustomParam2',
  fieldType: 'integer'
}]
```

L'appel du builder:

```
<FormSchemaBuilder
  lang="fr"
  schema={schema}
  editableExtensions={true}
  extendedFrom={extensions}
  onUpdate={onUpdate}
  components={{
    schmilblick: Schmilblick
  }}
  customFieldConfigurationSchemas={({
    notreChampCustom: {
      fields: [{
        field: 'someCustomParam1',
        fieldType: 'schmilblick'
      }, {
        field: 'someCustomParam2',
        fieldType: 'integer'
      }],
      order: ['labels', 'optional', 'sub', 'someCustomParam1', 'someCustomParam2']
    }
  })}
/>
```

Dans le cas du champ timings:

```
[{
  label: 'Label',
  field: 'label',
  fieldType: 'text'
}, {
  field: 'optional',
  fieldType: 'boolean'
}, {
  field: 'info',
  label: 'Texte d\'information'
  fieldType: 'text'
}, {
  field: 'enabledRanges',
  fieldType: 'enabledRanges'
}]
```

L'appel du builder qui utilise timings:
```
<FormSchemaBuilder
  lang="fr"
  schema={schema}
  editableExtensions={true}
  extendedFrom={extensions}
  onUpdate={onUpdate}
  components={{
    enabledRanges: EnabledRanges
  }}
  customFieldConfigurationSchemas={({
    timings: {
      fields: [{
        field: 'enabledRanges',
        fieldType: 'enabledRanges'
      }],
      order: [
        'labels', 'optional', 'sub', 'enabledRanges'
      ]
    }
  })}
/>
```