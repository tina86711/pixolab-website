<?php
setlocale(LC_CTYPE, 'zh_TW.UTF-8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Taipei');

/* Set e-mail recipient */
$tos = [
    'sscheah90@gmail.com' => '謝曉雙',
]; // Who will get this email.
$subject = 'Stark Tower - Online Contact';

/* Check all form inputs using check_input function */
$from = 'ivan@refine-lab.com'; // Will be set automatically by email service provider
$sender = 'Stark Tower';
$ccs = [];
$bccs = [];

$contact_name = check_input($_POST['name'], '請輸入姓名');
$contact_phone = check_input($_POST['phone'], '請輸入電話號碼');
$contact_line = $_POST['line'];
$contact_email = $_POST['email'];
$contact_content = $_POST['message'];

// Check errors
if (!filter_var($contact_email, FILTER_VALIDATE_EMAIL)) {
    show_error('Invalid email');
}

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\OAuth;

// Import Google OAuth 2.0 provider
use League\OAuth2\Client\Provider\Google;

// Start the session
session_start();

require_once './vendor/autoload.php';

// Gmail API credentials
// Gmail API credentials (REDACTED)
$clientId = 'YOUR_GOOGLE_CLIENT_ID';
$clientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';
$redirectUri = 'https://zeonproperties.ai/stark-tower/ch/a/token.php';
$refreshToken = file_get_contents('token.txt');

$provider = new Google([
    'clientId' => $clientId,
    'clientSecret' => $clientSecret,
    'redirectUri' => $redirectUri,
    'accessType' => 'offline'
]);

// create a new object
$mail = new PHPMailer();
// configure an SMTP
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
// TCP port to connect to (465 or 587)
$mail->Port = 465;
// OAuth 2.0 authentication
$mail->AuthType = 'XOAUTH2';

// OAuth settings
$mail->setOAuth(new OAuth([
    'provider' => $provider,
    'clientId' => $clientId,
    'clientSecret' => $clientSecret,
    'refreshToken' => $refreshToken,
    'userName' => 'leads.zeonproperties@gmail.com' // Your Gmail address
]));

$mail->setFrom($from, $sender);
foreach ($tos as $email => $name) {
    $mail->addAddress($email, $name);
}
foreach ($ccs as $email => $name) {
    $mail->addCC($email, $name);
}
foreach ($bccs as $email => $name) {
    $mail->addBCC($email, $name);
}
$mail->Subject = $subject;
// Set HTML
$mail->isHTML(TRUE);
$mail->Body = '<html>
<p>Registration Information:</p>

<p>Name: <b>' . $contact_name . '</b><br/>
Phone: <a href="tel:' . $contact_phone . '"><b>' . $contact_phone . '</b></a><br/>
Line ID: <b>' . $contact_line . '</b><br/>
Email: <a href="mailto:' . $contact_email . '"><b>' . $contact_email . '</b></a><br/>
Message: <b>' . $contact_content . '</b></p>

<p>This is an automated email, please do not reply to this email.</p>

</html>
';

$csv = NULL;
if (file_exists("entries.csv")) {
    $csv = fopen("entries.csv", "a") or die("Unable to open file!");
} else {
    $csv = fopen("entries.csv", "w") or die("Unable to open file!");
    $txt = "Name,Phone,LINE,Email,Message,Time,Status\n";
    fwrite($csv, $txt);
}

$contact_content = trim(preg_replace('/\s\s+/', ' ', $contact_content));

// send the message
if (!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
    $txt = $contact_name . "," . $contact_phone . "," . $contact_line . "," . $contact_email . "," . $contact_content . "," . date("Y/m/d H:m:s") . ",Failed\n";
    fwrite($csv, $txt);
    fclose($csv);
    exit();
} else {
    echo 'Message has been sent';
    $txt = $contact_name . "," . $contact_phone . "," . $contact_line . "," . $contact_email . "," . $contact_content . "," . date("Y/m/d H:m:s") . ",Success\n";
    fwrite($csv, $txt);
    fclose($csv);
    /* Redirect visitor to the thank you page */
    header('Location: thanks.html');
    exit();
}

/* Functions we used */
function check_input($data, $problem = '')
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    if ($problem && strlen($data) == 0) {
        show_error($problem);
    }
    return $data;
}

function show_error($myError)
{
    ?>
    <html>

    <body>
        <script>
            alert("<?php echo $myError; ?>")
            window.location.replace("../");
        </script>
    </body>

    </html>
    <?php exit();
}
?>