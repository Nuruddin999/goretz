export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
// Supersample on Retina or a viewport larger than the design canvas (capped for GPU cost).
const viewportScale = Math.min(window.innerWidth / VIEW_WIDTH, window.innerHeight / VIEW_HEIGHT);
export const RENDER_SCALE = Math.min(2, Math.max(1, Math.ceil(Math.max(window.devicePixelRatio || 1, viewportScale))));
