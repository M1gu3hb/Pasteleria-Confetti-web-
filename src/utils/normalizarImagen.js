// normalizarImagen — deja una imagen SIEMPRE derecha antes de subirla.
//
// Las fotos de celular (y algunos screenshots) guardan la rotación en los metadatos EXIF en vez
// de en los píxeles. Algunos visores no leen el EXIF y la muestran girada/de cabeza. Esto
// "hornea" la orientación EXIF en los píxeles y re-encoda la imagen DERECHA (sin EXIF), para que
// se vea igual en cualquier visor (incluido el POS del pastelero).
//
// Y ADEMÁS la ACHICA. Esto no es un lujo: el bucket `web-uploads` corta en 5 MB, y antes esta
// función re-encodaba a RESOLUCIÓN COMPLETA. Una foto de celular moderno (12–50 MP) reencodada
// entera en JPEG puede pesar MÁS que el original y chocar contra ese límite — y hasta hoy, que
// la subida fallara tumbaba el pedido ENTERO. 1600 px de lado mayor es de sobra para una foto de
// referencia que el pastelero mira en una tablet, y deja el archivo en un par de cientos de KB.
//
// Degradación segura: si el navegador no soporta la normalización o algo falla, devuelve el
// archivo ORIGINAL — nunca rompe la subida.
const LADO_MAXIMO = 1600;

export async function normalizarImagen(file) {
  try {
    if (!file || typeof file !== 'object') return file;
    const tipo = String(file.type || '');
    if (!tipo.startsWith('image/')) return file;
    if (tipo === 'image/svg+xml' || tipo === 'image/gif') return file;
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;

    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      bitmap = await createImageBitmap(file);
    }

    // Escala proporcional; nunca AGRANDA (una foto chica se queda como está).
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height) || 1);
    const ancho = Math.max(1, Math.round(bitmap.width * escala));
    const alto = Math.max(1, Math.round(bitmap.height * escala));

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close?.(); return file; }
    // Fondo blanco: los PNG con transparencia saldrían negros al pasar a JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ancho, alto);
    try { ctx.imageSmoothingQuality = 'high'; } catch { /* no todos lo soportan */ }
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return file;
    // Si por lo que sea el resultado pesa MÁS que el original y el original ya cabía,
    // nos quedamos con el original: el objetivo es que la subida no falle.
    if (file.size && blob.size > file.size && file.size <= 5 * 1024 * 1024) return file;
    const nombre = (file.name || 'imagen').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
