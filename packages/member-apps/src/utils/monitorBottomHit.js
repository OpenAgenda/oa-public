let onHit = false;
let monitoredElem;

function windowInnerHeight() {
  return (
    window.innerHeight
    || document.documentElement.clientHeight
    || document.getElementsByTagName('body')[0].clientHeight
  );
}

function _monitor() {
  if (!monitoredElem || !onHit) return;

  const diff = monitoredElem.offsetTop + monitoredElem.offsetHeight
    > Math.ceil(window.pageYOffset + windowInnerHeight() + 1);

  if (diff) return;

  onHit();
}

function monitorBottomHit(cb) {
  [monitoredElem] = document.getElementsByTagName('body');

  onHit = cb;
  _monitor();
}

monitorBottomHit.stop = () => {
  onHit = null;
};

export default monitorBottomHit;

if (typeof document !== 'undefined') {
  document.addEventListener('scroll', _monitor, false);
}
