import {svgAreaCalculation} from './svgAreaCalculation.js';

// Create an instance of the SvgAreaCalculation class
const areaCalculator = new svgAreaCalculation();

window.onload = function() {

  const totalArea = areaCalculator.areaInSvg('tutorial_svg');
  console.log(totalArea);
  const totalArea2 = areaCalculator.areaInSvgByGroup('tutorial_svg', '1');
  console.log(totalArea2);
  const totalArea3 = areaCalculator.areaInSvgByGroup('tutorial_svg', '2');
  console.log(totalArea3);
  const totalArea4 = areaCalculator.areaInSvgByGroup('tutorial_svg', '3');
  console.log(totalArea4);

  const totalAreaIntersect = areaCalculator.areaInSvgWithIntersection('tutorial_svg');
  console.log(totalAreaIntersect);
  const totalAreaIntersect2 = areaCalculator.areaInSvgWithIntersectionByGroup('tutorial_svg', '2', svgAreaCalculation.LIT_RANDOM_POINTS);
  console.log(totalAreaIntersect2);
  const totalAreaIntersect3 = areaCalculator.areaInSvgWithIntersectionByGroup('tutorial_svg', '2', svgAreaCalculation.MOD_RANDOM_POINTS);
  console.log(totalAreaIntersect2);
  const totalAreaIntersect4 = areaCalculator.areaInSvgWithIntersectionByGroup('tutorial_svg', '2', svgAreaCalculation.HIGH_RANDOM_POINTS);
  console.log(totalAreaIntersect2);
};
