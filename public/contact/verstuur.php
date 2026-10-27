<?php
// Contactformulier van flii.app: stuurt het bericht naar hello@flii.nl.
// Gebruikt dezelfde SMTP-instellingen als het stageformulier (smtp-config.php, niet in git);
// zonder die instellingen valt het terug op mail().
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

function antwoord($code, $data) { http_response_code($code); echo json_encode($data); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') antwoord(405, array('ok' => false, 'reason' => 'method_not_allowed'));

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) antwoord(400, array('ok' => false, 'reason' => 'bad_request'));

// Honeypot: bots vullen dit verborgen veld in. Doe alsof het gelukt is.
if (!empty($in['website'])) antwoord(200, array('ok' => true));

$clean = function ($v, $max) {
  $v = is_string($v) ? trim($v) : '';
  $v = str_replace(array("\r", "\0"), '', $v);
  return mb_substr($v, 0, $max, 'UTF-8');
};
$naam    = str_replace("\n", ' ', $clean(isset($in['naam']) ? $in['naam'] : '', 120));
$email   = str_replace("\n", '', $clean(isset($in['email']) ? $in['email'] : '', 200));
$bericht = $clean(isset($in['bericht']) ? $in['bericht'] : '', 4000);

$isMail = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
$isTel  = !$isMail && preg_match('/^\+?[0-9][0-9\s().-]{6,}$/', $email);
if ($naam === '' || $bericht === '' || (!$isMail && !$isTel)) {
  antwoord(422, array('ok' => false, 'reason' => 'invalid'));
}

// Eenvoudige rem: maximaal 5 berichten per 10 minuten per IP.
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'onbekend';
$rl = sys_get_temp_dir() . '/flii-contact-' . md5($ip);
$now = time();
$hits = array();
if (is_readable($rl)) { $hits = json_decode((string) @file_get_contents($rl), true); if (!is_array($hits)) $hits = array(); }
$hits = array_values(array_filter($hits, function ($t) use ($now) { return $t > $now - 600; }));
if (count($hits) >= 5) antwoord(429, array('ok' => false, 'reason' => 'too_many'));
$hits[] = $now;
@file_put_contents($rl, json_encode($hits));

$to      = 'hello@flii.nl';
$subject = '=?UTF-8?B?' . base64_encode('Contact via flii.app: ' . $naam) . '?=';
$body    = "Naam: $naam\n" . ($isMail ? 'E-mail' : 'Telefoon') . ": $email\n\n$bericht\n\n--\nVerstuurd via het contactformulier op flii.app";

$cfg = null;
foreach (array(__DIR__ . '/smtp-config.php', __DIR__ . '/../aanvraag/stage-internationaal/smtp-config.php', __DIR__ . '/../p/internship/international/smtp-config.php') as $p) {
  if (is_readable($p)) { $cfg = include $p; break; }
}
$from = ($cfg && !empty($cfg['from'])) ? $cfg['from'] : 'no-reply@flii.nl';

$headers  = 'From: Flii.app <' . $from . ">\r\n";
if ($isMail) $headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

function smtp_send($cfg, $to, $subject, $headers, $body) {
  $secure = isset($cfg['secure']) ? $cfg['secure'] : 'ssl';
  $from   = !empty($cfg['from']) ? $cfg['from'] : $cfg['user'];
  $fp = @fsockopen(($secure === 'ssl' ? 'ssl://' : '') . $cfg['host'], intval($cfg['port']), $errno, $errstr, 20);
  if (!$fp) return false;
  stream_set_timeout($fp, 20);
  $read = function () use ($fp) {
    $data = '';
    while (($line = fgets($fp, 515)) !== false) { $data .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
    return $data;
  };
  $cmd = function ($c) use ($fp, $read) { fputs($fp, $c . "\r\n"); return $read(); };
  $read();
  $cmd('EHLO flii.nl');
  if ($secure === 'tls') {
    $cmd('STARTTLS');
    if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) { fclose($fp); return false; }
    $cmd('EHLO flii.nl');
  }
  $cmd('AUTH LOGIN');
  $cmd(base64_encode($cfg['user']));
  if (strpos($cmd(base64_encode($cfg['pass'])), '235') === false) { fclose($fp); return false; }
  $cmd('MAIL FROM:<' . $from . '>');
  $cmd('RCPT TO:<' . $to . '>');
  if (strpos($cmd('DATA'), '354') === false) { fclose($fp); return false; }
  $data = 'Date: ' . date('r') . "\r\nTo: <" . $to . ">\r\nSubject: " . $subject . "\r\n" . $headers . "\r\n" . str_replace("\n", "\r\n", $body);
  $data = preg_replace('/^\./m', '..', $data);
  fputs($fp, $data . "\r\n.\r\n");
  $r = $read();
  $cmd('QUIT');
  fclose($fp);
  return strpos($r, '250') !== false;
}

$sent = false;
if ($cfg && !empty($cfg['host']) && !empty($cfg['user'])) $sent = smtp_send($cfg, $to, $subject, $headers, $body);
if (!$sent) $sent = @mail($to, $subject, $body, $headers);

if ($sent) antwoord(200, array('ok' => true));
antwoord(500, array('ok' => false, 'reason' => 'mail_failed'));
