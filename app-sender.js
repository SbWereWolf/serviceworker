var alert = $('#alert');
var alert_message = $('#alert-message');

const isEnable = 'fetch' in window;

if (!isEnable) {
    if (!('fetch' in window)) {
        showError('fetch not supported');
    }

    console.warn('This browser does not support Fetch Web API.');
    console.log('Support fetch', 'fetch' in window);

    $('submit').attr('disabled', 'disabled');
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
