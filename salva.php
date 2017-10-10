<?php

$file = fopen("registrazione.json","w+");
$json_string = $_POST['data'];

fwrite($file, $json_string);
fclose($file);

?>