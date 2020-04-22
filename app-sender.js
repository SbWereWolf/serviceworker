var form = $('#notification');
var massage_id = $('#massage_id');
var massage_row = $('#massage_row');
massage_row.hide();

var alert = $('#alert');
var alert_message = $('#alert-message');

const isEnable = 'Notification' in window &&
    'serviceWorker' in navigator &&
    'localStorage' in window &&
    'fetch' in window &&
    'postMessage' in window;

if (!isEnable) {
    if (!('Notification' in window)) {
        showError('Notification not supported');
    } else if (!('serviceWorker' in navigator)) {
        showError('ServiceWorker not supported');
    } else if (!('localStorage' in window)) {
        showError('LocalStorage not supported');
    } else if (!('fetch' in window)) {
        showError('fetch not supported');
    } else if (!('postMessage' in window)) {
        showError('postMessage not supported');
    }

    console.warn('This browser does not support desktop notification.');
    console.log('Is HTTPS', window.location.protocol === 'https:');
    console.log('Support Notification', 'Notification' in window);
    console.log('Support ServiceWorker', 'serviceWorker' in navigator);
    console.log('Support LocalStorage', 'localStorage' in window);
    console.log('Support fetch', 'fetch' in window);
    console.log('Support postMessage', 'postMessage' in window);
}

if (isEnable) {
    form.on('submit', function (event) {
        event.preventDefault();

        var notification = {};
        form.find('input').each(function () {
            var input = $(this);
            notification[input.attr('name')] = input.val();
        });

        sendNotification(notification);
    });
}

function getTokenFromServer() {
    return window.localStorage.getItem('sentFirebaseMessagingToken');
}

function sendNotification(notification) {
    var key = messagingSettings.ServerKey;

    console.log('Sending notification', notification);

    // hide previous notification data
    alert.hide();
    massage_row.hide();

    const currentToken = getTokenFromServer();

    const success = typeof currentToken !== typeof undefined
        && currentToken !== null;
    if (!success) {
        showError('Error retrieving Receiver Token');
    }
    if (success) {
        fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Authorization': 'key=' + key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Firebase loses 'image' from the notification.
                // And you must see this: https://github.com/firebase/quickstart-js/issues/71
                data: notification,
                to: currentToken
            })
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            console.log('Response', json);

            if (json.success === 1) {
                massage_row.show();
                massage_id.text(json.results[0].message_id);
            } else {
                massage_row.hide();
                massage_id.text(json.results[0].error);
            }
        }).catch(function (error) {
            showError(error);
        });
    }
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
