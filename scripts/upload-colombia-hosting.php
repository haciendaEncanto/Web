<?php
/**
 * upload-colombia-hosting.php
 *
 * Desplegar este archivo en public_html/ de Colombia Hosting
 * (contenido.hacienda-encanto.com/upload.php)
 *
 * Acepta POST multipart/form-data con:
 *   file   => imagen (JPG, PNG, WebP, max 5 MB) o PDF (max 10 MB)
 *   folder => carpeta destino (p.ej. "galeria/staff", "galeria/blog",
 *             "documentos/contratos")
 *
 * Devuelve JSON: { "success": true, "url": "https://..." }
 *             o  { "success": false, "error": "..." }
 */

header('Access-Control-Allow-Origin: https://www.hacienda-encanto.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$isPdf        = false;
$maxSize      = 5 * 1024 * 1024; // 5 MB (imágenes); PDFs hasta 10 MB

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Archivo no recibido o error de subida']);
    exit;
}

$file = $_FILES['file'];

$mime = mime_content_type($file['tmp_name']);
if (!in_array($mime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solo se permiten imágenes JPG, PNG, WebP o archivos PDF']);
    exit;
}

$isPdf   = ($mime === 'application/pdf');
$maxSize = $isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

if ($file['size'] > $maxSize) {
    http_response_code(400);
    $limitLabel = $isPdf ? '10 MB' : '5 MB';
    echo json_encode(['success' => false, 'error' => "El archivo supera $limitLabel"]);
    exit;
}

// Sanitizar carpeta destino — solo letras, números, guiones y barras
$folder = preg_replace('/[^a-z0-9\/\-_]/', '', strtolower($_POST['folder'] ?? 'galeria/staff'));
if (empty($folder) || strpos($folder, '..') !== false) {
    $folder = 'galeria/staff';
}

$uploadDir = __DIR__ . '/' . $folder . '/';
if (!is_dir($uploadDir)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'La carpeta destino no existe. Créala en cPanel primero.']);
    exit;
}

$ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
if (!in_array($ext, $allowed)) {
    $ext = $isPdf ? 'pdf' : 'jpg';
}

$prefix   = $isPdf ? 'doc_' : 'img_';
$filename = uniqid($prefix, true) . '.' . $ext;
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar el archivo']);
    exit;
}

$baseUrl = 'https://contenido.hacienda-encanto.com';
$url     = $baseUrl . '/' . $folder . '/' . $filename;

echo json_encode(['success' => true, 'url' => $url]);
