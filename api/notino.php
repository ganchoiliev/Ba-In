<?php
/**
 * /notino  ->  the Notino partner booking link, with every click counted.
 *
 * WHY THIS EXISTS. Google Analytics only sees visitors who accept the cookie
 * banner. In Oct-Nov 2026 Google Ads reported 97 paid clicks while Analytics
 * showed 95 sessions from every source combined, so the "notino_click" event
 * was a floor, not a count. Every booking click already passes through
 * ba-in.com/notino (.htaccess routes it here), so this is the one place the
 * real number can be taken.
 *
 * WHAT IS STORED. One line per click: date, hour, the page the click came
 * from, device class, and whether it looked like a person. No IP address, no
 * user agent, no cookie, no identifier of any kind. It counts clicks, not
 * people, and cannot be tied to anyone.
 *
 * WHERE. In ba-in-data/ beside the web root, next to ba-in-config.php. It must
 * not live inside the web root: the deploy runs rsync --delete, which removes
 * anything on the server that is not in the repository.
 *
 * THE RULE. The redirect is sent before anything else and nothing below it
 * may stop it. A booking that is not counted costs nothing; a booking link
 * that does not open costs a client.
 */

const NOTINO_URL = 'https://partner.notino.com/api/notino-partner/b2c/redirect/link/O4n2OwPORfjp';

error_reporting(0);
@ini_set('display_errors', '0');

// 302 on purpose: the partner URL can change, so browsers must not cache it.
header('Location: ' . NOTINO_URL, true, 302);
header('Cache-Control: no-store, max-age=0');
header('X-Robots-Tag: noindex, nofollow');

// Let the visitor go before doing any bookkeeping, where the server allows it.
if (function_exists('fastcgi_finish_request')) {
    @fastcgi_finish_request();
} elseif (function_exists('litespeed_finish_request')) {
    @litespeed_finish_request();
}

try {
    notino_count();
} catch (Throwable $e) {
    // counted or not, the visitor is already on their way
}

function notino_data_dir()
{
    $root = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\') : '';
    return ($root !== '' ? dirname($root) : dirname(__DIR__, 2)) . '/ba-in-data';
}

function notino_count()
{
    $method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
    $purpose = strtolower((isset($_SERVER['HTTP_SEC_PURPOSE']) ? $_SERVER['HTTP_SEC_PURPOSE'] : '')
        . ' ' . (isset($_SERVER['HTTP_PURPOSE']) ? $_SERVER['HTTP_PURPOSE'] : '')
        . ' ' . (isset($_SERVER['HTTP_X_MOZ']) ? $_SERVER['HTTP_X_MOZ'] : ''));

    // A browser warming up a link is not a click.
    if (strpos($purpose, 'prefetch') !== false || strpos($purpose, 'preview') !== false) {
        return;
    }

    // Link previews (Facebook, Viber, WhatsApp), crawlers and monitors open the
    // link too. They are logged, marked, and left out of the totals.
    $bot = $method !== 'GET' || $ua === '' || preg_match(
        '/bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-external|whatsapp|viber|telegram|skype|slack|discord|'
        . 'preview|embed|curl|wget|python|okhttp|go-http|java\/|libwww|httpclient|axios|node-fetch|headless|lighthouse|pagespeed|'
        . 'pingdom|uptime|monitor|scan|validator|feed|fetch/i',
        $ua
    );

    if ($bot) {
        $device = '-';
    } elseif (preg_match('/ipad|tablet|(android(?!.*mobile))/i', $ua)) {
        $device = 'tablet';
    } elseif (preg_match('/mobi|iphone|ipod|android/i', $ua)) {
        $device = 'mobile';
    } else {
        $device = 'desktop';
    }

    // Where the click came from: a page of this site, another site, or nowhere
    // (typed, an app, a printed QR code, a link that sends no referrer).
    $from = 'direct';
    $ref = isset($_SERVER['HTTP_REFERER']) ? (string) $_SERVER['HTTP_REFERER'] : '';
    if ($ref !== '') {
        $host = strtolower((string) parse_url($ref, PHP_URL_HOST));
        $host = preg_replace('/^www\./', '', $host);
        if ($host === 'ba-in.com') {
            $path = (string) parse_url($ref, PHP_URL_PATH);
            $path = preg_replace('/[^a-zA-Z0-9._\/-]/', '', $path);
            $from = ($path === '' || $path === '/' || $path === '/index.html') ? '/' : substr($path, 0, 80);
        } elseif ($host !== '') {
            $from = 'ext:' . substr(preg_replace('/[^a-z0-9.-]/', '', $host), 0, 60);
        }
    }

    $dir = notino_data_dir();
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $tz = new DateTimeZone('Europe/Sofia');
    $now = new DateTime('now', $tz);
    $line = $now->format('Y-m-d') . ',' . $now->format('H') . ',' . $from . ',' . $device . ',' . ($bot ? 'bot' : 'human') . "\n";
    @file_put_contents($dir . '/notino-clicks.csv', $line, FILE_APPEND | LOCK_EX);
}
