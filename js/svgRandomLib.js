import { svgRandomGenerate } from './svgRandomGenerate.js';

export function generateRandomRectangle(svgID, count = 1) {
  const generator = new svgRandomGenerate(svgID);
  generator.generateRandomRectangle(count);
}

export function generateRandomPolygon(svgID, count = 1) {
  const generator = new svgRandomGenerate(svgID);
  generator.generateRandomPolygon(count);
}

export { svgRandomGenerate };
