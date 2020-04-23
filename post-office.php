<?php
require_once 'Postman.php';

if (isset($_POST['send'])) {
    $postman = new Postman($_POST);
    $result = $postman->send();
    if ($result) {
        header('Location: /control-center.html');
    }
    if (!$result) {
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Fail</title>
        </head>
        <body style="display: flex;justify-content: space-around;">
        <div>
            <h1>Fail send message</h1>
            <a href="/control-center.html">
                Вернуться в центр управления
            </a>
        </div>
        </body>
        </html>
        <?php
    }
}

if (isset($_POST['subscribe'])) {
    $postman = new Postman($_POST);
    try {
        $result = $postman->subscribe();
    } catch (Throwable $e) {
        $result = false;
    }

    echo json_encode((int)$result);
}
if (isset($_POST['unsubscribe'])) {
    $postman = new Postman($_POST);
    try {
        $result = $postman->unsubscribe();
    } catch (Throwable $e) {
        $result = false;
    }

    echo json_encode((int)$result);
}
