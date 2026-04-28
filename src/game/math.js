export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const random = (min, max) => Math.random() * (max - min) + min;

export const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

export const getPlayfieldBottom = (height) => height - Math.min(170, height * 0.22);
