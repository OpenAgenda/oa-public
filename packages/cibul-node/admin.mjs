import back from './admin/back.mjs';
import agendasBack from './admin/agendas.back.mjs';

export default app => {
  back(app);
  agendasBack(app);
};
