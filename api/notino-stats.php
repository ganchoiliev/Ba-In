<?php
/**
 * Private view of the Notino click counter (see api/notino.php).
 *
 * Open ba-in.com/api/notino-stats.php and enter the key. The key is not in
 * this repository: it is the NOTINO_STATS_KEY constant in ba-in-config.php,
 * the file beside the web root that already holds the chat assistant's key.
 * Until that line exists this page stays closed.
 *
 *     define('NOTINO_STATS_KEY', 'a long phrase only you know');
 */

error_reporting(0);
@ini_set('display_errors', '0');
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');

$root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\') : '';
$base = $root !== '' ? dirname($root) : dirname(__DIR__, 2);
foreach (array('C:\\xampp\\ba-in-config.php', $base . '/ba-in-config.php', __DIR__ . '/ba-in-config.php') as $config) {
    if (is_file($config)) {
        require_once $config;
        break;
    }
}

function h($s)
{
    return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
}

function page($body)
{
    echo '<!doctype html><html lang="bg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex, nofollow"><title>Notino clicks</title><style>'
        . 'body{margin:0;padding:24px 18px 60px;background:#F2EDE6;color:#101111;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}'
        . 'main{max-width:720px;margin:0 auto}h1{font:400 28px/1.15 Georgia,serif;margin:0 0 6px}h2{font:600 13px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#72552B;margin:34px 0 8px}'
        . 'p{margin:0 0 12px;color:#5E584E}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{padding:9px 0;border-bottom:1px solid #D9CFC0;text-align:left}'
        . 'th{font-size:13px;color:#5E584E;font-weight:600}td.n,th.n{text-align:right}.big{display:flex;flex-wrap:wrap;gap:8px 36px;margin:18px 0 4px}.big div{font-size:14px;color:#5E584E}.big b{display:block;font:400 34px/1.1 Georgia,serif;color:#101111}'
        . 'input{font:inherit;padding:12px 14px;border:1px solid #D9CFC0;border-radius:3px;background:#FBF8F3;width:100%;max-width:340px;box-sizing:border-box}'
        . 'button{font:650 16px/1 system-ui,sans-serif;margin-top:12px;padding:15px 26px;border:0;border-radius:999px;background:#101111;color:#F2EDE6;cursor:pointer}label{display:block;margin:18px 0 6px;font-weight:600}'
        . '</style></head><body><main>' . $body . '</main></body></html>';
    exit;
}

if (!defined('NOTINO_STATS_KEY') || strlen((string) NOTINO_STATS_KEY) < 12) {
    page('<h1>Notino clicks</h1><p>This page is closed until a key is set. Add this line to <code>ba-in-config.php</code> (the file beside the web root that holds the chat key), with a phrase of at least 12 characters:</p>'
        . '<p><code>define(\'NOTINO_STATS_KEY\', \'your own long phrase\');</code></p>');
}

$given = isset($_POST['key']) ? (string) $_POST['key'] : '';
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals((string) NOTINO_STATS_KEY, $given)) {
    if ($given !== '') {
        sleep(2);
    }
    page('<h1>Notino clicks</h1><form method="post" autocomplete="off"><label for="k">Key</label>'
        . '<input id="k" name="key" type="password" required autofocus>'
        . ($given !== '' ? '<p style="color:#8a2f1e;margin-top:10px">That key is not right.</p>' : '')
        . '<div><button type="submit">Show the numbers</button></div></form>');
}

$file = $base . '/ba-in-data/notino-clicks.csv';
if (!is_file($file)) {
    page('<h1>Notino clicks</h1><p>No clicks recorded yet. The log will be created at <code>' . h($file) . '</code> on the first click.'
        . (is_writable($base) ? '' : ' That folder is not writable by PHP, so nothing can be recorded until it is.') . '</p>');
}

$days = array();
$months = array();
$from = array();
$device = array();
$bots = 0;
$total = 0;
$first = null;
$tz = new DateTimeZone('Europe/Sofia');
$today = (new DateTime('now', $tz))->format('Y-m-d');
$cut30 = (new DateTime('-29 days', $tz))->format('Y-m-d');
$cut7 = (new DateTime('-6 days', $tz))->format('Y-m-d');
$last7 = 0;
$last30 = 0;

$fh = fopen($file, 'r');
if ($fh) {
    while (($row = fgetcsv($fh, 400, ',', '"', '\\')) !== false) {
        if (count($row) < 5 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $row[0])) {
            continue;
        }
        if ($first === null) {
            $first = $row[0];
        }
        if ($row[4] !== 'human') {
            $bots++;
            continue;
        }
        $total++;
        $days[$row[0]] = (isset($days[$row[0]]) ? $days[$row[0]] : 0) + 1;
        $m = substr($row[0], 0, 7);
        $months[$m] = (isset($months[$m]) ? $months[$m] : 0) + 1;
        if ($row[0] >= $cut30) {
            $last30++;
            $from[$row[2]] = (isset($from[$row[2]]) ? $from[$row[2]] : 0) + 1;
            $device[$row[3]] = (isset($device[$row[3]]) ? $device[$row[3]] : 0) + 1;
        }
        if ($row[0] >= $cut7) {
            $last7++;
        }
    }
    fclose($fh);
}

arsort($from);
arsort($device);
krsort($months);

$out = '<h1>Notino clicks</h1><p>Every click on a booking button, counted on the server with no cookies. Counting since ' . h($first ? $first : $today) . '. Clicks, not people: one person clicking twice counts twice.</p>';
$out .= '<div class="big"><div><b>' . $last7 . '</b>last 7 days</div><div><b>' . $last30 . '</b>last 30 days</div><div><b>' . $total . '</b>all time</div></div>';

$out .= '<h2>By month</h2><table><tr><th>Month</th><th class="n">Clicks</th></tr>';
foreach ($months as $m => $n) {
    $out .= '<tr><td>' . h($m) . '</td><td class="n">' . $n . '</td></tr>';
}
$out .= '</table>';

$out .= '<h2>Where the click came from, last 30 days</h2><table><tr><th>Page or source</th><th class="n">Clicks</th></tr>';
foreach (array_slice($from, 0, 25, true) as $k => $n) {
    $label = $k === 'direct' ? 'No referrer (typed, app, QR code, ad)' : ($k === '/' ? 'Homepage' : $k);
    $out .= '<tr><td>' . h($label) . '</td><td class="n">' . $n . '</td></tr>';
}
$out .= '</table>';

$out .= '<h2>Device, last 30 days</h2><table><tr><th>Device</th><th class="n">Clicks</th></tr>';
foreach ($device as $k => $n) {
    $out .= '<tr><td>' . h($k) . '</td><td class="n">' . $n . '</td></tr>';
}
$out .= '</table>';

$out .= '<h2>Last 30 days, day by day</h2><table><tr><th>Day</th><th class="n">Clicks</th></tr>';
for ($i = 0; $i < 30; $i++) {
    $d = (new DateTime('-' . $i . ' days', $tz))->format('Y-m-d');
    $out .= '<tr><td>' . h($d) . '</td><td class="n">' . (isset($days[$d]) ? $days[$d] : 0) . '</td></tr>';
}
$out .= '</table>';
$out .= '<p style="margin-top:22px">Left out of every number above: ' . $bots . ' automated hits (link previews in Facebook, Viber and WhatsApp, crawlers, monitors).</p>';
page($out);
