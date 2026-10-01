/**
 * Converts Android VectorDrawable XML into standard SVG for instant visual rendering.
 * Supports android:viewportWidth, android:viewportHeight, android:pathData,
 * android:fillColor, android:strokeColor, android:strokeWidth, etc.
 */
export function convertAndroidVectorToSvg(xmlContent: string): string | null {
  if (!xmlContent.includes('<vector') || !xmlContent.includes('android:')) {
    return null;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    const vector = doc.querySelector('vector');
    if (!vector) return null;

    const vpWidth = vector.getAttribute('android:viewportWidth') || '24';
    const vpHeight = vector.getAttribute('android:viewportHeight') || '24';
    const width = vector.getAttribute('android:width') || `${vpWidth}dp`;
    const height = vector.getAttribute('android:height') || `${vpHeight}dp`;

    // Extract paths
    const paths = Array.from(vector.querySelectorAll('path'));
    if (paths.length === 0) return null;

    let svgPaths = '';
    for (const path of paths) {
      const pathData = path.getAttribute('android:pathData') || '';
      const fillColor = path.getAttribute('android:fillColor') || '#000000';
      const strokeColor = path.getAttribute('android:strokeColor');
      const strokeWidth = path.getAttribute('android:strokeWidth');
      const fillAlpha = path.getAttribute('android:fillAlpha');
      const strokeAlpha = path.getAttribute('android:strokeAlpha');

      let attrs = `d="${pathData}" fill="${fillColor}"`;
      if (strokeColor) attrs += ` stroke="${strokeColor}"`;
      if (strokeWidth) attrs += ` stroke-width="${strokeWidth}"`;
      if (fillAlpha) attrs += ` fill-opacity="${fillAlpha}"`;
      if (strokeAlpha) attrs += ` stroke-opacity="${strokeAlpha}"`;

      svgPaths += `  <path ${attrs} />\n`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vpWidth} ${vpHeight}" width="${width}" height="${height}">\n${svgPaths}</svg>`;
  } catch (err) {
    console.error('Vector to SVG conversion failed', err);
    return null;
  }
}
