function FirebaseMessagingClient(
    messaging, handleReset, handleSuccess, handleFail) {

    const messagingLib = messaging;
    const callbackForReset = handleReset;
    const callbackForSuccess = handleSuccess;
    const callbackForFail = handleFail;

    function sendTokenToServer(currentToken) {
        const wasSent = isTokenSentToServer(currentToken);
        if (!wasSent) {
            console.log('Sending token to server...');
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

    class FirebaseMessagingClient {

        notifyWithMessage(payload) {
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

        async getToken() {
            messagingLib.requestPermission()
                .then(function () {
                    // Get Instance ID token. Initially this makes a network call, once retrieved
                    // subsequent calls to getToken will return from cache.
                    messagingLib.getToken()
                        .then(function (currentToken) {

                            if (currentToken) {
                                sendTokenToServer(currentToken);
                                callbackForSuccess(currentToken);
                            } else {
                                setTokenSentToServer(false);
                                callbackForFail();
                                throw new Error('No Instance ID token available. Request permission to generate one');
                            }
                        })
                        .catch(function () {
                            setTokenSentToServer(false);
                            callbackForFail();
                            throw new Error('An error occurred while retrieving token');
                        });
                })
                .catch(function () {
                    throw new Error('Unable to get permission to notify');
                });
        }

        async dropToken() {
            messagingLib.getToken()
                .then(function (currentToken) {
                    messagingLib.deleteToken(currentToken)
                        .then(function () {
                            setTokenSentToServer(false);
                            callbackForReset();
                        })
                        .catch(function () {
                            throw new Error('Unable to delete token');
                        });
                })
                .catch(function () {
                    throw new Error('Error retrieving Instance ID token');
                });
        }

        async refreshToken() {
            messagingLib.getToken()
                .then(function (refreshedToken) {
                    // Send Instance ID token to app server.
                    sendTokenToServer(refreshedToken);
                    callbackForSuccess(refreshedToken);
                })
                .catch(function () {
                    throw new Error('Unable to retrieve refreshed token');
                });
        }
    }

    return new FirebaseMessagingClient();
}
