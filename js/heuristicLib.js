import { svgAreaCalculation } from './svgAreaCalculation.js';

/**
 * Simple wrapper to use the polygon intersection via one function
 */
export function lazyStupidAreaCalculation(svgID) {
  const intersector = new svgAreaCalculation();
  return intersector.lazyStupidAreaCalculation(svgID);
}

export function areaInSvgWithIntersection(svgID, numberOfRandomPoints) {
  const intersector = new svgAreaCalculation();
  return intersector.areaInSvgWithIntersection(svgID, numberOfRandomPoints);
}

export { svgAreaCalculation };
