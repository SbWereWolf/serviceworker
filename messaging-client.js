// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    const wasSent = isTokenSentToServer(currentToken);
    if (!wasSent) {
        console.log('Sending token to server...');
        // send current token to server
        //$.post(url, {token: currentToken});
        setTokenSentToServer(currentToken);
    }
    if (wasSent) {
        console.log('Token already sent to server so won\'t send it again unless it changes');
    }
}

function isTokenSentToServer(currentToken) {
    return window.localStorage.getItem('sentFirebaseMessagingToken') === currentToken;
}

function setTokenSentToServer(currentToken) {
    if (currentToken) {
        window.localStorage.setItem('sentFirebaseMessagingToken', currentToken);
    }
    if (!currentToken) {
        window.localStorage.removeItem('sentFirebaseMessagingToken');
    }
}

function notifyWithMessage(payload) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js');
    Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
            navigator.serviceWorker.ready.then(function (registration) {
                // Copy data object to get parameters in the click handler
                payload.data.data = JSON.parse(JSON.stringify(payload.data));

                registration.showNotification(payload.data.title, payload.data);
            }).catch(function () {
                // registration failed :(
                throw new Error('ServiceWorker registration failed')
            });
        }
    });
}

async function getToken(handleSuccess, handleFail) {
    messaging.requestPermission()
        .then(function () {
            // Get Instance ID token. Initially this makes a network call, once retrieved
            // subsequent calls to getToken will return from cache.
            messaging.getToken()
                .then(function (currentToken) {

                    if (currentToken) {
                        sendTokenToServer(currentToken);
                        handleSuccess(currentToken);
                    } else {
                        setTokenSentToServer(false);
                        handleFail();
                        throw new Error('No Instance ID token available. Request permission to generate one');
                    }
                })
                .catch(function () {
                    setTokenSentToServer(false);
                    handleFail();
                    throw new Error('An error occurred while retrieving token');
                });
        })
        .catch(function () {
            throw new Error('Unable to get permission to notify');
        });
}

async function dropToken(handleSuccess) {
    messaging.getToken()
        .then(function (currentToken) {
            messaging.deleteToken(currentToken)
                .then(function () {
                    setTokenSentToServer(false);
                    handleSuccess();
                })
                .catch(function () {
                    throw new Error('Unable to delete token');
                });
        })
        .catch(function () {
            throw new Error('Error retrieving Instance ID token');
        });
}

async function refreshToken(handleSuccess) {
    messaging.getToken()
        .then(function (refreshedToken) {
            // Send Instance ID token to app server.
            sendTokenToServer(refreshedToken);
            handleSuccess(refreshedToken);
        })
        .catch(function () {
            throw new Error('Unable to retrieve refreshed token');
        });
}