<?php
header('Content-Type: text/html');
echo "<h2>Counter System Test</h2>";

// Configuration - same as counter.php
$counterFile = 'counter.txt';
$ipLogFile = 'ip_log.txt';

// Basic environment checks
echo "<h3>PHP Environment</h3>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "Script Path: " . __FILE__ . "<br>";
echo "Current Directory: " . getcwd() . "<br>";

// File permissions checks
echo "<h3>File Permissions</h3>";

// Counter file check
echo "Counter File ($counterFile): ";
if (file_exists($counterFile)) {
    echo "EXISTS, ";
    
    if (is_readable($counterFile)) {
        echo "is READABLE, ";
        $currentCount = file_get_contents($counterFile);
        echo "Current count: $currentCount, ";
    } else {
        echo "NOT READABLE, ";
    }
    
    if (is_writable($counterFile)) {
        echo "is WRITABLE";
    } else {
        echo "NOT WRITABLE";
    }
    
    // Show permissions in cross-platform way
    echo "<br>File Size: " . filesize($counterFile) . " bytes<br>";
    echo "Last Modified: " . date("Y-m-d H:i:s", filemtime($counterFile)) . "<br>";
    echo "Permissions: " . substr(sprintf('%o', fileperms($counterFile)), -4) . "<br>";
} else {
    echo "DOES NOT EXIST<br>";
    echo "Attempting to create...<br>";
    $result = @file_put_contents($counterFile, '0');
    echo $result !== false ? "Created successfully." : "Failed to create file.";
}

echo "<br><br>";

// IP log file check
echo "IP Log File ($ipLogFile): ";
if (file_exists($ipLogFile)) {
    echo "EXISTS, ";
    
    if (is_readable($ipLogFile)) {
        echo "is READABLE, ";
        $lineCount = count(file($ipLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        echo "Contains $lineCount entries, ";
    } else {
        echo "NOT READABLE, ";
    }
    
    if (is_writable($ipLogFile)) {
        echo "is WRITABLE";
    } else {
        echo "NOT WRITABLE";
    }
    
    // Show permissions in cross-platform way
    echo "<br>File Size: " . filesize($ipLogFile) . " bytes<br>";
    echo "Last Modified: " . date("Y-m-d H:i:s", filemtime($ipLogFile)) . "<br>";
    echo "Permissions: " . substr(sprintf('%o', fileperms($ipLogFile)), -4) . "<br>";
} else {
    echo "DOES NOT EXIST<br>";
    echo "Attempting to create...<br>";
    $result = @file_put_contents($ipLogFile, '');
    echo $result !== false ? "Created successfully." : "Failed to create file.";
}

// Test writing a new IP entry
echo "<h3>Write Test</h3>";
echo "Testing write access to IP log file...<br>";
$testResult = @file_put_contents($ipLogFile, "test-ip|" . time() . "\n", FILE_APPEND);
if ($testResult !== false) {
    echo "Write test SUCCEEDED<br>";
} else {
    echo "Write test FAILED<br>";
}

// Test counter.php output directly
echo "<h3>Counter.php Output Test</h3>";
echo "Attempting to get counter.php output...<br>";
$url = "counter.php";
echo "URL: $url<br>";

// Use native PHP file methods to read counter.php output
$context = stream_context_create([
    'http' => [
        'ignore_errors' => true
    ]
]);

$output = @file_get_contents($url, false, $context);
if ($output === false) {
    echo "Failed to get output from counter.php<br>";
    echo "Error: " . error_get_last()['message'] . "<br>";
} else {
    echo "Output received:<br><pre>" . htmlspecialchars($output) . "</pre>";
}

// Suggest fixes
echo "<h3>Recommendations</h3>";
echo "<ul>";

if (!file_exists($counterFile) || !is_writable($counterFile)) {
    echo "<li>Fix counter.txt permissions using your FTP client or hosting control panel</li>";
    echo "<li>Make sure counter.txt is writeable by the web server</li>";
}

if (!file_exists($ipLogFile) || !is_writable($ipLogFile)) {
    echo "<li>Fix ip_log.txt permissions using your FTP client or hosting control panel</li>";
    echo "<li>Make sure ip_log.txt is writeable by the web server</li>";
}

echo "<li>Verify that PHP has write permissions to the directory</li>";
echo "<li>Check if you need to create the files manually with proper permissions</li>";
echo "<li>Check your PHP error logs for any specific errors</li>";
echo "</ul>";

// JavaScript test
echo "<h3>JavaScript Fetch Test</h3>";
?>

<div>
    Visitor count: <span id="jsTestCount">Testing...</span>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const countElement = document.getElementById('jsTestCount');
    
    console.log('Testing fetch to counter.php...');
    countElement.textContent = 'Sending request...';
    
    fetch('counter.php')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            countElement.textContent = 'Parsing response...';
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            countElement.textContent = `SUCCESS: ${JSON.stringify(data)}`;
        })
        .catch(error => {
            console.error('Fetch error:', error);
            countElement.textContent = `ERROR: ${error.message}`;
        });
});
</script> 