const completeExternalActions = (externalActions, extIds) => {
  if (!extIds || !externalActions)
    return { externalActions: false, usedExtIds: [] };

  const completedExternalActions = [];
  const usedExtIds = [];

  for (const actionsByExtId of externalActions) {
    if (extIds.map((id) => id.key).includes(actionsByExtId.key)) {
      if (
        !usedExtIds.find(
          (e) =>
            e.key === extIds.find((id) => id.key === actionsByExtId.key).key,
        )
      ) {
        usedExtIds.push({
          ...extIds.find((id) => id.key === actionsByExtId.key),
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
            extIds.find((id) => id.key === actionsByExtId.key).value,
          ),
          extId: extIds.find((id) => id.key === actionsByExtId.key),
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
