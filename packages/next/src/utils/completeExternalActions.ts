const completeExternalActions = (externalActions, extIds) => {
  if (!extIds || !externalActions)
    return { externalActions: false, usedExtIds: [] };

  const completedExternalActions = [];
  const usedExtIds = [];

  for (const actionsByExtId of externalActions) {
    if (extIds.map((id) => id.key).includes(actionsByExtId.key)) {
      const matchingExtId = extIds.find((id) => id.key === actionsByExtId.key);

      // Skip if the extId value is null or undefined
      if (matchingExtId.value == null) {
        continue;
      }

      if (!usedExtIds.find((e) => e.key === matchingExtId.key)) {
        usedExtIds.push({
          ...matchingExtId,
          label: actionsByExtId.label,
        });
      }
      for (const action of Object.keys(actionsByExtId.actions)) {
        if (!actionsByExtId.actions[action]) {
          continue;
        }
        completedExternalActions.push({
          action,
          key: actionsByExtId.key,
          link: actionsByExtId.actions[action].link.replace(
            '{value}',
            matchingExtId.value,
          ),
          extId: matchingExtId,
          label: actionsByExtId.actions[action].label,
        });
      }
    }
  }

  if (completedExternalActions.length && usedExtIds.length)
    return { externalActions: completedExternalActions, usedExtIds };
  return { externalActions: false, usedExtIds: [] };
};

export default completeExternalActions;
