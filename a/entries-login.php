<?php
error_reporting(E_ALL & ~E_NOTICE);
session_start();
/* Detect if the $_SESSION variable has already been set 
(meaning the user has already entered the password during the session) */
if (isset($_SESSION["authed"]) && $_SESSION["authed"] === true) {
    header("location:entries.php");
    exit(307);
}

$password = "theconleygo"; // This is where your password goes

if ($_SERVER["REQUEST_METHOD"] == "POST") { // Run code when form is submitted
    if ($_POST["password"] == $password) {
        $_SESSION["authed"] = true; // Set variable to access on protected page
        header("location:entries.php"); // Redirect to protected page
        exit(307); // Stop all other scripts
    } else {
        $err = "The password you entered was inncorrect.";
    }
}
?>
<!DOCTYPE html>
<html lang="en-GB">
    <head>
        <title> Enter Password - TBM Productions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">
		<style>
			html, body {
				font-family: "Quicksand", sans-serif;
				
			}

			input {
            	font-size: 16px;
            	padding: 8px 12px;
            	border-radius: 4px;
            	appearance: none;
				border: 1px solid #888;
            }

			.box {
            	color: #555;
            	padding: 12px 24px;
				max-width: 340px;
            	margin: 5rem auto;
				border-radius: 12px;
				box-shadow: 0 2px 8px 2px rgba(0,0,0,.15);
            }
		</style>
    </head>
    <body>
        <div class="box">
            <form method="POST" action='<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>'>
                <div class="labels">
                    <h1>Login</h1>
                    <p style="font-family: arial;"> Please enter the password to access the Entry Page. </p>
                </div>
                <div class="input-group">
                    <input type="password" name="password" placeholder="Enter Password"/>
                    <input type="submit" value="Enter"/><br>
                    <p style="color: red;"><?php echo $err; ?></p>
                </div>
            </form>
        </div>
    </body>
</html>
