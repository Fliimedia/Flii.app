<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'reason' => 'method_not_allowed'));
  exit;
}

$raw  = file_get_contents('php://input');
$lead = json_decode($raw, true);
if (!is_array($lead)) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'reason' => 'bad_request'));
  exit;
}

$to = 'info@flii.nl';
$id = 'lead_' . time();

$c    = isset($lead['contact']) && is_array($lead['contact']) ? $lead['contact'] : array();
$name = isset($c['name']) ? trim($c['name']) : '';
$subjectRaw = 'Nieuwe stage-aanvraag' . ($name !== '' ? ': ' . $name : '');
$subject    = '=?UTF-8?B?' . base64_encode($subjectRaw) . '?=';

function section($title, $arr) {
  if (!is_array($arr)) return '';
  $out = strtoupper($title) . "\n";
  foreach ($arr as $k => $v) {
    if (is_array($v)) continue;
    $out .= '  ' . $k . ': ' . $v . "\n";
  }
  return $out . "\n";
}

$body  = "Nieuwe internationale stage-aanvraag via flii.app\n";
$body .= 'Ingediend: ' . (isset($lead['submittedAt']) ? $lead['submittedAt'] : '') . "\n";
$body .= 'Taal: ' . (isset($lead['language']) ? $lead['language'] : '') . "\n\n";
if (!empty($lead['contact']))    $body .= section('Contact', $lead['contact']);
if (!empty($lead['address']))    $body .= section('Adres', $lead['address']);
if (!empty($lead['education']))  $body .= section('Opleiding', $lead['education']);
if (!empty($lead['internship'])) $body .= section('Stage', $lead['internship']);
if (!empty($lead['income']))     $body .= section('Inkomen', $lead['income']);
if (!empty($lead['documents'])) {
  $docs = $lead['documents'];
  unset($docs['passportFile']);
  $body .= section('Documenten', $docs);
}
if (!empty($lead['consent']))    $body .= section('Toestemming', $lead['consent']);

$file     = isset($lead['documents']['passportFile']) ? $lead['documents']['passportFile'] : null;
$boundary = 'b_' . md5(uniqid('', true));

// Config voor SMTP staat in smtp-config.php (niet in git). Zonder config -> mail().
$cfg = null;
$cfgPath = __DIR__ . '/smtp-config.php';
if (is_readable($cfgPath)) { $cfg = include $cfgPath; }
$from = ($cfg && !empty($cfg['from'])) ? $cfg['from'] : 'no-reply@flii.nl';

$headers  = 'From: ' . $from . "\r\n";
if (!empty($c['email'])) $headers .= 'Reply-To: ' . $c['email'] . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= 'Content-Type: multipart/mixed; boundary="' . $boundary . '"' . "\r\n";

$msg  = '--' . $boundary . "\r\n";
$msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
$msg .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$msg .= $body . "\r\n";

if ($file && !empty($file['data'])) {
  $fname = preg_replace('/[^A-Za-z0-9._-]/', '_', isset($file['name']) ? $file['name'] : 'paspoort');
  $ftype = isset($file['type']) && $file['type'] !== '' ? $file['type'] : 'application/octet-stream';
  $msg .= '--' . $boundary . "\r\n";
  $msg .= 'Content-Type: ' . $ftype . '; name="' . $fname . '"' . "\r\n";
  $msg .= "Content-Transfer-Encoding: base64\r\n";
  $msg .= 'Content-Disposition: attachment; filename="' . $fname . '"' . "\r\n\r\n";
  $msg .= chunk_split($file['data']) . "\r\n";
}
$msg .= '--' . $boundary . '--';

function smtp_send($cfg, $to, $subject, $headers, $bodyMime) {
  $host   = $cfg['host'];
  $port   = intval($cfg['port']);
  $user   = $cfg['user'];
  $pass   = $cfg['pass'];
  $secure = isset($cfg['secure']) ? $cfg['secure'] : 'ssl';
  $from   = !empty($cfg['from']) ? $cfg['from'] : $user;

  $transport = ($secure === 'ssl') ? 'ssl://' . $host : $host;
  $fp = @fsockopen($transport, $port, $errno, $errstr, 20);
  if (!$fp) return false;
  stream_set_timeout($fp, 20);

  $read = function() use ($fp) {
    $data = '';
    while (($line = fgets($fp, 515)) !== false) {
      $data .= $line;
      if (isset($line[3]) && $line[3] === ' ') break;
    }
    return $data;
  };
  $cmd = function($c) use ($fp, $read) { fputs($fp, $c . "\r\n"); return $read(); };

  $read();
  $cmd('EHLO flii.nl');
  if ($secure === 'tls') {
    $cmd('STARTTLS');
    if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) { fclose($fp); return false; }
    $cmd('EHLO flii.nl');
  }
  $cmd('AUTH LOGIN');
  $cmd(base64_encode($user));
  $r = $cmd(base64_encode($pass));
  if (strpos($r, '235') === false) { fclose($fp); return false; }
  $cmd('MAIL FROM:<' . $from . '>');
  $cmd('RCPT TO:<' . $to . '>');
  $r = $cmd('DATA');
  if (strpos($r, '354') === false) { fclose($fp); return false; }

  $data  = 'Date: ' . date('r') . "\r\n";
  $data .= 'To: <' . $to . '>' . "\r\n";
  $data .= 'Subject: ' . $subject . "\r\n";
  $data .= $headers . "\r\n";
  $data .= $bodyMime;
  $data  = preg_replace('/^\./m', '..', $data);
  fputs($fp, $data . "\r\n.\r\n");
  $r = $read();
  $cmd('QUIT');
  fclose($fp);
  return strpos($r, '250') !== false;
}

$sent = false;
if ($cfg && !empty($cfg['host']) && !empty($cfg['user'])) {
  $sent = smtp_send($cfg, $to, $subject, $headers, $msg);
}
if (!$sent) {
  $sent = @mail($to, $subject, $msg, $headers);
}

if ($sent) {
  echo json_encode(array('ok' => true, 'id' => $id));
} else {
  http_response_code(500);
  echo json_encode(array('ok' => false, 'reason' => 'mail_failed'));
}
