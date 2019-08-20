$(document).ready(function () {
  var config = window.okta.config;
  var signIn = new OktaSignIn({
    clientId: config.clientId,
    baseUrl: config.baseUrl,
    redirectUri: config.redirectUri
  });

  function getSession() {
    return signIn.authClient.session.get()
      .then(function (session) {
        if (session.status === "ACTIVE") {
          return session.user().then(function (user) {
            return {
              session,
              user
            }
          });
        }
        return { session, user: {} };
      })
      .catch(function (err) {
        console.error("session error", err);
      });
  }

  function showWelcomeMessage(profile) {
    $('#okta-info .firstName').html(profile.firstName);
    $('#okta-info').show();
  }

  getSession()
    .then(function(res) {
      if (res.session.status === 'ACTIVE') {
        showWelcomeMessage(res.user.profile);
      }
    })
    .catch(function(err){
        console.error(err);
    });
});
  