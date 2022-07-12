/**
 * Returns the HEX value of an RGB color combo
 * 
 * @param {int} r Red Value
 * @param {int} g Green Value
 * @param {int} b Blue Value
 * @returns 
 */
export function rgbToHex(r, g, b) {
  return ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

/**
 * Returns the RGB colour combo of an HEX color code
 * 
 * @param {str} hex Hex Code
 * @returns 
 */
export function hexToRGB(hex) {
   let alpha = false,
    h = hex.slice(hex.startsWith('#') ? 1 : 0);
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  else if (h.length === 8) alpha = true;
  h = parseInt(h, 16);
  return (
    'rgb' +
    (alpha ? 'a' : '') +
    '(' +
    (h >>> (alpha ? 24 : 16)) +
    ', ' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ', ' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '') +
    ')'
  ); 
}
