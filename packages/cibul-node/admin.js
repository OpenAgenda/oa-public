import back from './admin/back.js';
import agendasBack from './admin/agendas.back.js';

export default app => {
  back(app);
  agendasBack(app);
};
