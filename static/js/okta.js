// wait for the page to load
$(document).ready(function () {
  // create an instance of the Okta Sign-In widget
  var config = window.okta.config;
  var signIn = new OktaSignIn({
    clientId: config.clientId,
    baseUrl: config.baseUrl,
    redirectUri: config.redirectUri
  });

  // function to get the active login session, if exists
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

  // if there's an active login session, show the welcome message
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
  