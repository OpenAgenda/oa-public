export default function createWidgetManager(managerTarget) {
  const registered = [];
  const readyQueue = [];
  let isReadyQueueExecuted = false;

  if (managerTarget._e?.length) {
    readyQueue.push(...managerTarget._e);
    delete managerTarget._e;
  }

  function ready(callback) {
    if (
      isReadyQueueExecuted
      || document.readyState === 'complete'
      || document.readyState === 'interactive'
    ) {
      callback(managerTarget);
    } else {
      readyQueue.push(callback);
    }
  }

  function register(widgetId, widgetInstance) {
    if (!registered.some((widget) => widget.id === widgetId)) {
      registered.push({ id: widgetId, instance: widgetInstance });
    }
  }

  function load(element = document.body) {
    registered.forEach((widget) => {
      try {
        widget.instance.load(element);
      } catch (e) {
        console.error(`Failed to load widget ${widget.id}:`, e);
      }
    });
  }

  function executeReadyQueue() {
    while (readyQueue.length > 0) {
      const callback = readyQueue.shift();
      callback(managerTarget);
    }
    isReadyQueueExecuted = true;
  }

  return {
    register,
    load,
    ready,
    executeReadyQueue,
  };
}
