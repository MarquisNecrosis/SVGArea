import {svgAreaCalculation} from './svgAreaCalculation.js';

// Create an instance of the SvgAreaCalculation class
const areaCalculator = new svgAreaCalculation();

window.onload = function() {

  const totalArea = areaCalculator.calculateAreaOfAllSvgElements('tutorial_svg');
  console.log(totalArea);
  const totalArea2 = areaCalculator.calculateAreaOfAllSvgElementsByGroup('tutorial_svg', '1');
  console.log(totalArea2);
  const totalArea3 = areaCalculator.calculateAreaOfAllSvgElementsByGroup('tutorial_svg', '2');
  console.log(totalArea3);
  const totalArea4 = areaCalculator.calculateAreaOfAllSvgElementsByGroup('tutorial_svg', '3');
  console.log(totalArea4);

  const totalAreaIntersect = areaCalculator.calculateAreaOfAllElementsWithIntersection('tutorial_svg');
  console.log(totalAreaIntersect);
};
