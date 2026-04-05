<?php
declare(strict_types=1);

// ---------- LOGGING BÁSICO ----------
$LOG_PATH = '/home/SEU_USUARIO/logs/php-error.log'; // ajuste o usuário

// captura warnings/notices em log
set_error_handler(function($severity, $message, $file, $line) use ($LOG_PATH) {
    error_log("[PHP ERROR] $message in $file:$line\n", 3, $LOG_PATH);
    return false; // deixa o PHP continuar o fluxo padrão também
});

// captura exceções não tratadas
set_exception_handler(function(Throwable $e) use ($LOG_PATH) {
    $cid = bin2hex(random_bytes(6)); // correlation id
    $msg = sprintf("[EXCEPTION %s] %s in %s:%d\nStack: %s\n",
        $cid, $e->getMessage(), $e->getFile(), $e->getLine(), $e->getTraceAsString()
    );
    error_log($msg, 3, $LOG_PATH);

    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal Server Error', 'cid' => $cid]);
    exit;
});

// log simples por linha (se quiser usar)
function app_log(string $line) {
    global $LOG_PATH;
    error_log("[APP] " . $line . "\n", 3, $LOG_PATH);
}
// ------------------------------------
