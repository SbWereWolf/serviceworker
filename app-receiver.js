firebase.initializeApp({
    messagingSenderId: messagingSettings.SenderID
});

var bt_register = $('#register');
var bt_delete = $('#delete');
var token = $('#token');

var info = $('#info');
var info_message = $('#info-message');

var alert = $('#alert');
var alert_message = $('#alert-message');

resetUI();

const isEnable = 'Notification' in window &&
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window;

if (!isEnable) {
    if (!('Notification' in window)) {
        showError('Notification not supported');
    } else if (!('serviceWorker' in navigator)) {
        showError('ServiceWorker not supported');
    } else if (!('localStorage' in window)) {
        showError('LocalStorage not supported');
    } else if (!('fetch' in window)) {
        showError('fetch not supported');
    }

    console.warn('This browser does not support desktop notification.');
    console.log('Is HTTPS', window.location.protocol === 'https:');
    console.log('Support Notification', 'Notification' in window);
    console.log('Support ServiceWorker', 'serviceWorker' in navigator);
    console.log('Support LocalStorage', 'localStorage' in window);
    console.log('Support fetch', 'fetch' in window);

    updateUIForPushPermissionRequired();
}

if (isEnable) {
    var messaging = firebase.messaging();

    // already granted
    if (Notification.permission === 'granted') {
        getToken(updateUIForPushEnabled,
            updateUIForPushPermissionRequired)
            .catch(function (e) {
                showError(e.message);
            });
    }

    // get permission on subscribe only once
    bt_register.on('click', function () {
        getToken(updateUIForPushEnabled,
            updateUIForPushPermissionRequired)
            .catch(function (e) {
                showError(e.message);
            });
    });

    bt_delete.on('click', function () {
        // Delete Instance ID token.
        dropToken(resetUI)
            .catch(function (e) {
                showError(e.message);
            });
    });

    // handle catch the notification on current page
    messaging.onMessage(function (payload) {
        console.log('Message received', payload);
        info.show();
        info_message
            .text('')
            .append('<strong>' + payload.data.title + '</strong>')
            .append('<em>' + payload.data.body + '</em>')
        ;

        try {
            // register fake ServiceWorker for show notification on mobile devices
            notifyWithMessage(payload);
        } catch (e) {
            showError(e.message);
        }

    });

    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function () {
        refreshToken(updateUIForPushEnabled).catch(function (e) {
            showError(e.message);
        });
    });
}

function updateUIForPushEnabled(currentToken) {
    console.log(currentToken);
    token.text(currentToken);
    bt_register.hide();
    bt_delete.show();
}

function resetUI() {
    token.text('');
    bt_register.show();
    bt_delete.hide();
    info.hide();
}

function updateUIForPushPermissionRequired() {
    bt_register.attr('disabled', 'disabled');
    resetUI();
}

function showError(error, error_data) {
    if (typeof error_data !== typeof undefined) {
        console.error(error, error_data);
    } else {
        console.error(error);
    }

    alert.show();
    alert_message.html(error);
}
