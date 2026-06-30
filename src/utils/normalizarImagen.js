// normalizarImagen — deja una imagen SIEMPRE derecha antes de subirla.
//
// Las fotos de celular (y algunos screenshots) guardan la rotación en los metadatos EXIF en vez
// de en los píxeles. Algunos visores no leen el EXIF y la muestran girada/de cabeza. Esto
// "hornea" la orientación EXIF en los píxeles y re-encoda la imagen DERECHA (sin EXIF), para que
// se vea igual en cualquier visor (incluido el POS del pastelero).
//
// Degradación segura: si el navegador no soporta la normalización o algo falla, devuelve el
// archivo ORIGINAL — nunca rompe la subida.
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
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return file;
    const nombre = (file.name || 'imagen').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
