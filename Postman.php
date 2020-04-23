<?php


class Postman
{
    private $parameters;

    public function __construct($parameters)
    {
        $this->parameters = $parameters;
    }

    public function send()
    {
        $key = static::readFile('.key');
        $addressee = static::readFile('.addressee');

        $result = false;
        $may = !empty($key) && !empty($addressee);
        if ($may) {
            $curl = curl_init();

            curl_setopt_array($curl, array(
                CURLOPT_URL => "https://fcm.googleapis.com/fcm/send",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => json_encode(
                    ['data' => $this->parameters,
                        'to' => $addressee]),
                CURLOPT_HTTPHEADER => array(
                    "authorization: key=$key",
                    "Content-Type: application/json"
                ),
            ));

            $response = curl_exec($curl);
            $payload = json_decode($response);
            $result = json_last_error() === 0;
            if ($result) {
                $result = $payload->success === 1;
            }
            curl_close($curl);
        }

        return $result;
    }

    /**
     * @param $source
     * @return false|string
     */
    private static function readFile($source)
    {
        $descriptor = fopen($source, 'r', false);
        $key = stream_get_contents($descriptor);
        fclose($descriptor);
        return $key;
    }

    public function subscribe()
    {

        $descriptor = fopen('.addressee', 'w', false);
        fwrite($descriptor, $_POST['addressee']);
        fclose($descriptor);

        return true;
    }

    public function unsubscribe()
    {

        $descriptor = fopen('.addressee', 'w', false);
        fwrite($descriptor, null);
        fclose($descriptor);

        return true;
    }
}