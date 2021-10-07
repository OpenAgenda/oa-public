import axios from 'axios';

function switchToLegacyAdminPage(slug) {
  axios
    .post(`/${slug}/admin/settings/edit`, {
      settings: {
        lab: {
          eventAdmin: false,
          status: false,
        },
      },
    })
    .then(() => {
      window.location.href = `/${slug}/admin/events`;
    });
}

export default switchToLegacyAdminPage;
