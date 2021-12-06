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

addLoadEvent(() => render(window.oa));
