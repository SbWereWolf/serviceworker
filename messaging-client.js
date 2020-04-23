function FirebaseMessagingClient(
    messaging, unsubscribed, subscribed, failure) {

    const messagingLib = messaging;
    const whenUnsubscribed = unsubscribed;
    const whenSubscribed = subscribed;
    const whenFail = failure;

    function composeRequest(details) {
        const formParameters = [];
        for (const property in details) {
            if (details.hasOwnProperty(property)) {
                const key = encodeURIComponent(property);
                const value = encodeURIComponent(details[property]);
                formParameters.push(key + "=" + value);
            }
        }
        formBody = formParameters.join("&");

        const headers = new Headers({
            "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8",
        });
        // noinspection UnnecessaryLocalVariableJS
        const request = new Request("/post-office.php", {
            method: "POST",
            headers: headers,
            body: formBody,
        });
        return request;
    }

    async function subscribe(currentToken) {
        const details = {
            "addressee": currentToken,
            "subscribe": true,
        };
        const request = composeRequest(details);

        return fetch(request);
    }

    async function unsubscribe() {
        const details = {
            "unsubscribe": true,
        };
        const request = composeRequest(details);

        return fetch(request);
    }

    function attach(currentToken) {
        subscribe(currentToken)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                const success = json === 1;
                if (!success) {
                    whenUnsubscribed();
                }
                if (success) {
                    whenSubscribed(currentToken);
                }
            })
            .catch(() => {
                whenFail();
            });
    }

    function detach() {
        unsubscribe()
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                const success = json === 1;
                if (!success) {
                    whenSubscribed(currentToken);
                }
                if (success) {
                    whenUnsubscribed();
                }
            })
            .catch(() => {
                whenFail();
            });
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
                    messagingLib.getToken()
                        .then(function (currentToken) {
                            if (!currentToken) {
                                throw new Error('No Instance ID token available. Request permission to generate one');
                            }
                            if (currentToken) {
                                attach(currentToken);
                            }
                        })
                        .catch(function () {
                            whenFail();
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
                            detach();
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
                    attach(refreshedToken);
                })
                .catch(function () {
                    throw new Error('Unable to retrieve refreshed token');
                });
        }
    }

    return new FirebaseMessagingClient();
}
