import { OAUTH2_CLIENT_ID, OAUTH2_SCOPES } from '../config';
import watch from './watch';
const wd = window.opener || window;
let googleApiClient;
const oauth2TokenEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
const oauth2Endpoint = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
const youtubeSearchEndpoint = 'https://www.googleapis.com/youtube/v3/search';
function setSignIn(signedIn = true) {
  localStorage.setItem('gApis.signedIn', signedIn);
}
function isSignedIn() {
  return localStorage.getItem('gApis.signedIn') === 'true';
}
function setSigningIn(signingIn = true) {
  localStorage.setItem('gApis.signingIn', signingIn);
}
function setSignedIn() {
  setSignIn();
  setSigningIn(false);
}
function isSigningIn() {
  return localStorage.getItem('gApis.signingIn') === 'true';
}
function setOAuth2Token(token) {
  googleApiClient.token = token;
  localStorage.setItem('gApis.token', JSON.stringify(token));
}
function deleteOAuth2Token() {
  localStorage.removeItem('gApis.token');
}
function getOAuth2Token() {
  const token = localStorage.getItem('gApis.token');
  return !token ? undefined : JSON.parse(token);
}
function setOAuth2Session(session) {
  localStorage.setItem(
    'gApis.session',
    JSON.stringify({
      ...session,
      expiresIn: session.expires_in * 1000,
      expirationTime: new Date().getTime()
    })
  );
}
function deleteOAuth2Session() {
  localStorage.removeItem('gApis.session');
}
function getOAuth2Session() {
  const session = localStorage.getItem('gApis.session');
  return !session ? undefined : JSON.parse(session);
}
function isChildWindow() {
  return Boolean(window.opener);
}
function isSessionExpired() {
  const session = getOAuth2Session();
  if (!session) {
    return true;
  }
  return (
    new Date().getTime() - Number(session.expiresIn) > session.expirationTime
  );
}
/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn(doc) {
  if (isSessionExpired()) {
    setSignIn(false);
  }
  if (isSignedIn()) {
    return;
  }
  setSigningIn();

  // Google's OAuth 2.0 endpoint for requesting an access token

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  const form = doc.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2TokenEndpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: OAUTH2_CLIENT_ID,
    redirect_uri: `${window.location.protocol}//${
      window.location.host
    }/authentication`,
    response_type: 'token',
    scope: OAUTH2_SCOPES,
    include_granted_scopes: 'true',
    state: 'pass-through value'
  };

  // Add form parameters as hidden input values.
  for (const p in params) {
    const input = doc.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }
  setSignedIn();
  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  doc.body.appendChild(form);
  form.submit();
  form.remove();
}
let accessTokenResolve;
let accessTokenReject;
const accessTokenPromise = new Promise((resolve, reject) => {
  accessTokenResolve = resolve;
  accessTokenReject = reject;
});
function accessTokenAvailable() {
  const token = getOAuth2Token();
  if (token) {
    return Promise.resolve(token);
  }
  return accessTokenPromise;
}
function googleApiClientReady() {
  return new Promise(resolve => {
    if (!wd._GOOGLE_API_CLIENT) {
      wd._GOOGLE_API_CLIENT = watch(
        {
          ready: true,
          token: getOAuth2Token() || {}
        },
        () => {
          if (googleApiClient.token.access_token) {
            accessTokenResolve(googleApiClient.token);
          }
          return;
        }
      );
      resolve(false);
      googleApiClient = wd._GOOGLE_API_CLIENT;
    } else {
      googleApiClient = wd._GOOGLE_API_CLIENT;
      resolve(true);
    }
  });
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
export function checkAuth() {
  return googleApiClientReady().then(
    () =>
      new Promise((resolve, reject) => {
        if (isSignedIn()) {
          if (/^\/authentication/.test(window.location.pathname)) {
            if (!window.location.hash) {
              accessTokenReject();
              setSignedIn(false);
              window.close();
              return;
            }
            const token = window.location.hash
              .substr(1)
              .split('&')
              .filter(pair => pair)
              .map(pair => {
                const [key, value] = pair.split('=');
                return { key, value };
              })
              .reduce(
                (result, { key, value }) => ({
                  ...result,
                  [key]: value
                }),
                {}
              );

            setOAuth2Token(token);
            window.close();
            return;
          }
        }
        const token = getOAuth2Token();
        if (
          ((!isSignedIn() && !isSigningIn()) || !token || isSessionExpired()) &&
          !isChildWindow()
        ) {
          const newWindow = window.open('/authentication', '_blank');
          newWindow.focus();
          newWindow.addEventListener(
            'load',
            () => {
              oauthSignIn(newWindow.document);
            },
            true
          );
        }
        accessTokenAvailable()
          .then(({ access_token: accessToken, ...rest }) => {
            if (accessToken) {
              return fetch(`${oauth2Endpoint}?access_token=${accessToken}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                }
              });
            }
            reject(rest);
          }, reject)
          .then(res => res.json(), reject)
          .then(response => {
            if (response.error_description) {
              deleteOAuth2Session();
              deleteOAuth2Token();
              reject(response);
              return;
            }
            const token = getOAuth2Token();
            setOAuth2Session(response);
            resolve(token);
          }, reject);
      })
  );
}

export function search(query, options) {
  const {
    part = 'snippet',
    order = 'viewCount',
    type = 'video',
    videoDefinition = 'high',
    maxResults = 9,
    ...rest
  } =
    options || {};
  return checkAuth().then(
    ({ access_token }) =>
      fetch(
        Object.keys(rest).reduce(
          (queryString, param) =>
            !rest[param]
              ? queryString
              : `${queryString}&${param}=${encodeURIComponent(rest[param])}`,
          `${youtubeSearchEndpoint}?access_token=${access_token}&part=${part}&order=${order}&q=${query}&type=${type}&videoDefinition=${videoDefinition}&maxResults=${maxResults}`
        ),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${access_token}`
          }
        }
      ).then(res => res.json()),
    err => {
      setSignIn(false);
      console.error('Something weird happened!', err);
      window.location.reload();
    }
  );
}
