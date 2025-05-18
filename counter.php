<?php
session_start();
$counterFile = 'counter.txt';

// 如果这个会话还没被计数
if (!isset($_SESSION['counted'])) {
    // 读取当前计数
    if (file_exists($counterFile)) {
        $count = (int)file_get_contents($counterFile);
    } else {
        $count = 0;
    }

    // 增加计数
    $count++;

    // 保存新的计数
    file_put_contents($counterFile, $count);
    
    // 标记这个会话已被计数
    $_SESSION['counted'] = true;
} else {
    // 如果已经计数过，只读取当前值
    $count = (int)file_get_contents($counterFile);
}

// 返回JSON格式的计数
header('Content-Type: application/json');
echo json_encode(['count' => $count]);
?> 