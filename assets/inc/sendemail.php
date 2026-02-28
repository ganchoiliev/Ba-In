<?php

// ===============================
// CONFIG
// ===============================
define("RECIPIENT_NAME", "Beauty Atelier IN");
define("RECIPIENT_EMAIL", "nikolaeva@ba-in.com");

// ===============================
// READ FORM VALUES
// ===============================
$success = false;

$name         = isset($_POST['name']) ? trim($_POST['name']) : "";
$senderEmail  = isset($_POST['email']) ? trim($_POST['email']) : "";
$phone        = isset($_POST['phone']) ? trim($_POST['phone']) : "";
$services     = isset($_POST['services']) ? trim($_POST['services']) : "";
$date         = isset($_POST['date']) ? trim($_POST['date']) : "";
$doctor       = isset($_POST['doctor']) ? trim($_POST['doctor']) : "";
$message      = isset($_POST['message']) ? trim($_POST['message']) : "";

// защита от header injection
$message = preg_replace("/(From:|To:|BCC:|CC:|Subject:|Content-Type:)/", "", $message);

// ===============================
// EMAIL SUBJECT
// ===============================
$mail_subject = "Ново запитване от сайта – " . $name;

// ===============================
// EMAIL BODY
// ===============================
$body  = "Име: $name\r\n";
$body .= "Имейл: $senderEmail\r\n";

if ($phone)    { $body .= "Телефон: $phone\r\n"; }
if ($services) { $body .= "Процедура: $services\r\n"; }
if ($date)     { $body .= "Предпочитана дата: $date\r\n"; }
if ($doctor)   { $body .= "Специалист: $doctor\r\n"; }

$body .= "\r\nСъобщение:\r\n$message";

// ===============================
// SEND EMAIL
// ===============================
if ($name && $senderEmail && $message) {

    $recipient = RECIPIENT_NAME . " <" . RECIPIENT_EMAIL . ">";

    // ВАЖНО: From е твой имейл (по-малък шанс за SPAM)
    $headers  = "From: Beauty Atelier IN <info@ba-in.com>\r\n";
    $headers .= "Reply-To: $name <$senderEmail>\r\n";
     
    // --- ADD THIS LINE BELOW ---
    $headers .= "Bcc: iliyana2023@abv.bg\r\n"; 
    // ---------------------------
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $success = mail($recipient, $mail_subject, $body, $headers);

    if ($success) {
        echo "<div class='inner success'><p class='success'>Благодарим ви за съобщението! Ще се свържем с вас възможно най-скоро.</p></div>";
    } else {
        echo "<div class='inner error'><p class='error'>Възникна грешка при изпращане. Моля, опитайте отново.</p></div>";
    }

} else {
    echo "<div class='inner error'><p class='error'>Моля, попълнете задължителните полета.</p></div>";
}

?>
