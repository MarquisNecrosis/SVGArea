import {svgAreaCalculation} from './svgAreaCalculation.js';

// Create an instance of the SvgAreaCalculation class
const areaCalculator = new svgAreaCalculation();

window.onload = function() {

  const totalArea = areaCalculator.calculateAreaOfAllSvgElements('tutorial_svg');
  console.log(totalArea);
};
