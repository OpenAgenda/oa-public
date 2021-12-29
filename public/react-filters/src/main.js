import render from './render';

function addLoadEvent(func) {
  const oldonload = window.onload;

  if (typeof window.onload !== 'function') {
    window.onload = func;
  } else {
    window.onload = () => {
      if (oldonload) oldonload();
      func();
    };
  }
}

function main() {
  render(window.oa);
}

if (document.readyState === 'complete') {
  main();
} else {
  addLoadEvent(main);
}
