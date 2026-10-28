import { CONFIG, clamp } from './config.js';

// Project art AND catch ellipses through the same fixed oblique camera.
export function project(x, forward, playerForward) {
  const ahead = forward - playerForward;
  const scale = clamp(1 / (1 + ahead / 1100), .4, 1.32);
  return { x: 270 + (x - 270) * scale + ahead * .085 * scale,
    y: CONFIG.anchorY - ahead * scale * 1.05, scale };
}
export function modelPoint([x, forward, height]) { return [x + forward * .34, -forward * .62 - height]; }
export function polygon(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath(); ctx.fill();
}
export function shade(hex, factor) {
  const values = hex.slice(1).match(/../g).map((part) => Math.min(255, Math.round(parseInt(part, 16) * factor)));
  return '#' + values.map((value) => value.toString(16).padStart(2, '0')).join('');
}
// Extruded meshes. Top vertices may have different heights (articulated wings).
export function prism(ctx, vertices, thickness, color) {
  const top = vertices.map(modelPoint);
  const bottom = vertices.map(([x, y, z]) => modelPoint([x, y, z - thickness]));
  for (let i = 0; i < vertices.length; i++) {
    const next = (i + 1) % vertices.length;
    polygon(ctx, [bottom[i], bottom[next], top[next], top[i]], shade(color, i % 2 ? .67 : .81));
  }
  polygon(ctx, top, color);
}
export function block(ctx, x, y, z, width, length, height, color) {
  prism(ctx, [[x-width/2,y-length/2,z], [x+width/2,y-length/2,z], [x+width/2,y+length/2,z], [x-width/2,y+length/2,z]], height, color);
}
