<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'reason' => 'method_not_allowed']);
  exit;
}

$raw  = file_get_contents('php://input');
$lead = json_decode($raw, true);
if (!is_array($lead)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'reason' => 'bad_request']);
  exit;
}

$to   = 'info@flii.nl';
$from = 'no-reply@flii.nl'; // adres op je eigen domein voor bezorging
$id   = 'lead_' . time();

$c    = isset($lead['contact']) && is_array($lead['contact']) ? $lead['contact'] : array();
$name = isset($c['name']) ? trim($c['name']) : '';
$subject = 'Nieuwe stage-aanvraag' . ($name !== '' ? ': ' . $name : '');

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

$ok = @mail($to, $subject, $msg, $headers);
if ($ok) {
  echo json_encode(['ok' => true, 'id' => $id]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'reason' => 'mail_failed']);
}
