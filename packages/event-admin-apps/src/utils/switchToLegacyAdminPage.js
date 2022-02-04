import axios from 'axios';

function switchToLegacyAdminPage(slug) {
  axios.post(`/${slug}/admin/settings/adminevents/old`).then(() => {
    window.location.href = `/${slug}/admin/events`;
  });
}

export default switchToLegacyAdminPage;
