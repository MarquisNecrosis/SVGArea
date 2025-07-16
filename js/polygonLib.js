import { svgAreaIntersection } from './svgAreaIntersection.js';

/**
 * Simple wrapper to use the polygon intersection via one function
 */
export function polygonIntersectionInSvg(svgID, options = {}) {
  const {
    show = false,
    redraw = true,
    color = 'blue',
    opacity = 1,
    group = null,
  } = options;

  const intersector = new svgAreaIntersection(svgID);
  return intersector.polygonIntersectionInSvg(show, redraw, color, opacity, group);
}

export { svgAreaIntersection };
