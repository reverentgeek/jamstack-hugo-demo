$(document).ready(function () {
  var config = window.okta.config;
  var signIn = new OktaSignIn({
    clientId: config.clientId,
    baseUrl: config.baseUrl,
    redirectUri: config.redirectUri,
    authParams: {
      display: 'page',
      responseType: 'code',
      grantType: 'authorization_code'
    },
    features: {
      registration: true
    }
  });

  function isRedirect() {
    return /((code|state)=)/.test(window.location.hash);
  }
  
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
    $('#okta-login-firstname').html(profile.firstName)
    $('#okta-login-success').show();
  }

  $('#okta-sign-out').click(function() {
    signIn.authClient.session.close().then(function() {
      location.reload();
    });
  });

  if (isRedirect()) {
    signIn.authClient.token.parseFromUrl()
      .then(function (res) {
        var accessToken = res[0];
        var idToken = res[1];
        signIn.authClient.tokenManager.add('accessToken', accessToken);
        signIn.authClient.tokenManager.add('idToken', idToken);

        return getSession()
          .then(function(res) {
            showWelcomeMessage(res.user.profile);
          })
          .catch(function (err) {
            console.error("getSession error", err);
          });
      })
      .catch(function (err) {
        console.error("parseFromUrl error", err);
      });
  } else {
    getSession()
      .then(function(res) {
        if (res.session.status === 'ACTIVE') {
          showWelcomeMessage(res.user.profile);
          return;
        }
        signIn.renderEl({ el: '#okta-login-container' });
      })
      .catch(function(err){
        console.error(err);
      });
  }
});
