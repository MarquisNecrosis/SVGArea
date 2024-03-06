import {svgAreaCalculation} from './svgAreaCalculation.js';
import { svgAreaIntersection } from './svgAreaIntersection.js';
import {svgRandomGenerate} from './svgRandomGenerate.js';

// Create an instance of the SvgAreaCalculation class
const areaCalculator = new svgAreaCalculation();
const svgRandom = new svgRandomGenerate('tutorial_svg');
const intersectElements = new svgAreaIntersection('tutorial_svg');

window.onload = function() {
  svgRandom.generateRandomRectangle(10);

  const parentElement = document.getElementById('tutorial_svg');
  const bbox = parentElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;
  const totalAreaSvg = width * height;
  console.log(totalAreaSvg);
  intersectElements.polygonIntersectionInSvg('tutorial_svg');
  const checkbox = document.getElementById('opacity-test');

  checkbox.addEventListener('input', function() {
    const elements = document.querySelectorAll('.intersect-object');
    const value = this.value;
    elements.forEach(element => {
      element.style.opacity = value;
    });
  });
  /*
  svgRandom.generateRandomRectangle(20);
 const totalArea = areaCalculator.areaInSvg('tutorial_svg');
 console.log(totalArea);*/
 /*
  const totalArea = areaCalculator.areaInSvg('tutorial_svg');
  console.log(totalArea);
  const totalArea2 = areaCalculator.areaInSvgByGroup('tutorial_svg', '1');
  console.log(totalArea2);
  const totalArea3 = areaCalculator.areaInSvgByGroup('tutorial_svg', '2');
  console.log(totalArea3);
  const totalArea4 = areaCalculator.areaInSvgByGroup('tutorial_svg', '3');
  console.log(totalArea4);

  const totalAreaIntersect2 = areaCalculator.areaInSvgWithIntersection('tutorial_svg', svgAreaCalculation.LIT_RANDOM_POINTS);
  console.log(totalAreaIntersect2);
  const totalAreaIntersect3 = areaCalculator.areaInSvgWithIntersection('tutorial_svg', svgAreaCalculation.MOD_RANDOM_POINTS);
  console.log(totalAreaIntersect3);
  const totalAreaIntersect4 = areaCalculator.areaInSvgWithIntersection('tutorial_svg', svgAreaCalculation.HIGH_RANDOM_POINTS);
  console.log(totalAreaIntersect4);
  const preciseArea = areaCalculator.lazyStupidAreaCalculation('tutorial_svg');
  console.log(preciseArea);
  
  intersectElements.lineIntersection(1, 1, 3, 2, 1, 4, 2, -1);
  intersectElements.lineIntersection(-1, 0, 4, 0, 1, 4, 1, -1);
*/
};
