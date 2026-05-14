// TODO just this => { NEW: 0, SEEN: 1, READ: 2 }

const notificationStates = ['new', 'seen', 'read'];

const codes = [0, 1, 2];

const reverse = {
  new: 0,
  seen: 1,
  read: 2,
};

export default Object.assign(notificationStates, { codes, reverse });
export { codes, reverse };
