// using jQuery, wait for the document to finish loading
$(document).ready(function () {
  // grab the Okta config injected by /layouts/partials/script.html
  var config = window.okta.config;

  // create an instance of the Okta Sign-In widget
  var signIn = new OktaSignIn({
    clientId: config.clientId,          // required okta config
    baseUrl: config.baseUrl,            // required okta config
    redirectUri: config.redirectUri,    // required okta config
    authParams: {
      display: 'page',
      responseType: 'code',             // authParams set to use PKCE
      grantType: 'authorization_code'
    },
    features: {
      registration: true                // allow user self-registration
    }
  });

  // test to see if the current request is a redirect back from Okta login
  function isRedirect() {
    return /((code|state)=)/.test(window.location.hash);
  }
  
  // get the active login session
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

  // assign a click function to the sign out button
  $('#okta-sign-out').click(function() {
    signIn.authClient.session.close().then(function() {
      location.reload();
    });
  });

  if (isRedirect()) {
    // parse the token passed back from Okta
    signIn.authClient.token.parseFromUrl()
      .then(function (res) {
        var accessToken = res[0];
        var idToken = res[1];
        // set tokens for the active session
        signIn.authClient.tokenManager.add('accessToken', accessToken);
        signIn.authClient.tokenManager.add('idToken', idToken);

        // use the Okta API to get the current user
        return getSession()
          .then(function(res) {
            // show welcome message
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
    // try getting the active session
    getSession()
      .then(function(res) {
        if (res.session.status === 'ACTIVE') {
          // session is active, so show the welcome message
          showWelcomeMessage(res.user.profile);
          return;
        }
        // session is not active, so show the login widget
        signIn.renderEl({ el: '#okta-login-container' });
      })
      .catch(function(err){
        console.error(err);
      });
  }
});
