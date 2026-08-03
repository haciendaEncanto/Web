<?php
/**
 * upload.php — Endpoint de subida de archivos para Hacienda El Encanto
 *
 * Colocar en: public_html/upload.php
 * El archivo se sube vía POST multipart/form-data desde el navegador del editor,
 * autenticado con el header X-Upload-Token.
 *
 * Configurar en .htaccess (mismo directorio):
 *   SetEnv UPLOAD_TOKEN "tu-uuid-secreto"
 *   php_value upload_max_filesize 500M
 *   php_value post_max_size 512M
 *   php_value memory_limit 512M
 *   php_value max_execution_time 300
 */

// ─── CORS ─────────────────────────────────────────────────────────────────────

header('Access-Control-Allow-Origin: https://www.hacienda-encanto.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: X-Upload-Token, Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Método ───────────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// ─── Autenticación por token ───────────────────────────────────────────────────

$token    = $_SERVER['HTTP_X_UPLOAD_TOKEN'] ?? '';
$expected = getenv('UPLOAD_TOKEN') ?: '';

if (!$expected || !hash_equals($expected, $token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token inválido o no configurado']);
    exit;
}

// ─── Parámetro folder ─────────────────────────────────────────────────────────

$folder = trim($_POST['folder'] ?? '');

$allowed_folders = [
    'galeria/boda',
    'galeria/quince',
    'galeria/empresarial',
    'galeria/revelacion',
    'galeria/general',
    'videos',
    'documentos',
    'avatars/firmas',
    'sitio',
];

if (!in_array($folder, $allowed_folders, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Carpeta no permitida: '$folder'"]);
    exit;
}

// ─── Archivo ──────────────────────────────────────────────────────────────────

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $code = $_FILES['file']['error'] ?? -1;
    $msgs = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera upload_max_filesize en php.ini',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera MAX_FILE_SIZE del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió parcialmente',
        UPLOAD_ERR_NO_FILE    => 'No se recibió ningún archivo',
        UPLOAD_ERR_NO_TMP_DIR => 'Falta directorio temporal en el servidor',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir en disco',
        UPLOAD_ERR_EXTENSION  => 'Una extensión PHP detuvo la subida',
    ];
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $msgs[$code] ?? "Error de subida (código $code)"]);
    exit;
}

$file     = $_FILES['file'];
$mimeType = mime_content_type($file['tmp_name']);
$size     = $file['size'];

// ─── Validación de tipo y tamaño ──────────────────────────────────────────────

$imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
$docTypes   = ['application/pdf'];

$imageLimitBytes = 10  * 1024 * 1024;   // 10 MB
$videoLimitBytes = 500 * 1024 * 1024;   // 500 MB
$docLimitBytes   = 50  * 1024 * 1024;   // 50 MB

if (in_array($mimeType, $imageTypes, true)) {
    if ($size > $imageLimitBytes) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'La imagen supera el límite de 10 MB']);
        exit;
    }
} elseif (in_array($mimeType, $videoTypes, true)) {
    if ($size > $videoLimitBytes) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'El video supera el límite de 500 MB']);
        exit;
    }
} elseif (in_array($mimeType, $docTypes, true)) {
    if ($size > $docLimitBytes) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'El documento supera el límite de 50 MB']);
        exit;
    }
} else {
    http_response_code(415);
    echo json_encode(['success' => false, 'error' => "Tipo de archivo no permitido: $mimeType"]);
    exit;
}

// ─── Nombre único y ruta destino ──────────────────────────────────────────────

$origExt    = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$uniqueName = time() . '_' . bin2hex(random_bytes(6)) . '.' . $origExt;

$baseDir = __DIR__;                          // public_html/
$destDir = $baseDir . '/' . $folder;        // public_html/galeria/boda/

if (!is_dir($destDir)) {
    if (!mkdir($destDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo crear la carpeta destino']);
        exit;
    }
}

$destPath = $destDir . '/' . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo mover el archivo al destino']);
    exit;
}

// ─── Respuesta exitosa ────────────────────────────────────────────────────────

$publicUrl = 'https://contenido.hacienda-encanto.com/' . $folder . '/' . $uniqueName;
echo json_encode(['success' => true, 'url' => $publicUrl]);
