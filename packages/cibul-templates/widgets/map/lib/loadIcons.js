'use strict';

module.exports = (state, data) => {
  const icons = {
    ...state.icons
  };

  if (!data?.ebd?.mi) {
    return icons;
  }

  if (data.ebd.mi.a) {
    icons.active.icon = data.ebd.mi.a;
    icons.active.anchor = [data.ebd.ms.a[0]/2, data.ebd.ms.a[1]];
    icons.active.size = [data.ebd.ms.a[0], data.ebd.ms.a[1]];
  }

  if (data.ebd.mi.i) {
    icons.inactive.icon = data.ebd.mi.i;
    icons.inactive.anchor = [data.ebd.ms.i[0]/2, data.ebd.ms.i[1]];
    icons.inactive.size = [data.ebd.ms.i[0], data.ebd.ms.i[1]];
  }

  return icons;
}