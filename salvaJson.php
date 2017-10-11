<?php

$file = fopen("completo.json","w+");
$json_string = $_POST['data'];

fwrite($file, $json_string);
fclose($file);

?>