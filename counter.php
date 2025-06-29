<?php
header('Content-Type: application/json');

// Configuration
$counterFile = 'counter.txt';
$ipLogFile = 'ip_log.txt';
$expireTime = 86400; // 24 hours in seconds

// Function to check if IP has visited recently
function hasVisitedRecently($ip) {
    global $ipLogFile, $expireTime;
    
    if (!file_exists($ipLogFile)) {
        return false;
    }
    
    $ipLog = file($ipLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $currentTime = time();
    
    foreach ($ipLog as $line) {
        list($loggedIP, $timestamp) = explode('|', $line);
        
        if ($loggedIP === $ip && ($currentTime - $timestamp) < $expireTime) {
            return true;
        }
    }
    
    return false;
}

// Function to log IP with timestamp
function logIP($ip) {
    global $ipLogFile;
    
    $timestamp = time();
    $logEntry = $ip . '|' . $timestamp . "\n";
    
    // Clean up old entries periodically (1 in 10 chance)
    if (mt_rand(1, 10) === 1) {
        cleanupIPLog();
    }
    
    file_put_contents($ipLogFile, $logEntry, FILE_APPEND);
}

// Function to remove old IP entries
function cleanupIPLog() {
    global $ipLogFile, $expireTime;
    
    if (!file_exists($ipLogFile)) {
        return;
    }
    
    $ipLog = file($ipLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $currentTime = time();
    $newLog = [];
    
    foreach ($ipLog as $line) {
        list($loggedIP, $timestamp) = explode('|', $line);
        
        if (($currentTime - $timestamp) < $expireTime) {
            $newLog[] = $line;
        }
    }
    
    file_put_contents($ipLogFile, implode("\n", $newLog) . "\n");
}

// Get visitor IP address
$ip = $_SERVER['REMOTE_ADDR'];

// Initialize counter file if it doesn't exist
if (!file_exists($counterFile)) {
    file_put_contents($counterFile, '0');
}

// Get current count
$count = (int) file_get_contents($counterFile);

// Check if this IP has visited recently
if (!hasVisitedRecently($ip)) {
    // Increment counter and update file
    $count++;
    file_put_contents($counterFile, $count);
    
    // Log the IP with timestamp
    logIP($ip);
}

// Return count as JSON
echo json_encode(['count' => $count]);
?> 