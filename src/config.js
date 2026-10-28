// Logical pixels are world units; 10 units = 1 displayed metre.
export const CONFIG = Object.freeze({
  width: 540, height: 900, anchorY: 648, minX: 30, maxX: 510,
  step: 1 / 60, steering: 260, warningTime: 1.5,
  jumpMultiplier: 1.5, flockMultiplier: .35,
  catchStart: .15, catchEnd: 1, jumpDuration: 1.05,
  catchX: 28, catchForward: 35, fallDuration: .45,
});
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const difficulty = (metres) => clamp(metres / 1200, 0, 1);
export const baseSpeed = (metres) => 180 + 150 * difficulty(metres);
