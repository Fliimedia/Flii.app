<?php
// Kopieer dit bestand naar smtp-config.php (op de host, NIET in git)
// en vul je echte gegevens in. submit.php gebruikt SMTP als dit bestaat,
// anders valt hij terug op de standaard mail() functie.
return array(
  'host'   => 'smtp.hostinger.com',
  'port'   => 465,           // 465 = ssl, 587 = tls
  'secure' => 'ssl',         // 'ssl' of 'tls'
  'user'   => 'no-reply@flii.nl',
  'pass'   => 'JOUW_WACHTWOORD_HIER',
  'from'   => 'no-reply@flii.nl',
);
