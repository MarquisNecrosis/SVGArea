import { svgAreaCalculation } from './svgAreaCalculation.js';
import { svgAreaIntersection } from './svgAreaIntersection.js';
import { svgRandomGenerate } from './svgRandomGenerate.js';

// Create an instance of the SvgAreaCalculation class
const areaCalculator = new svgAreaCalculation();
const intersectElements = new svgAreaIntersection('tutorial_svg');

window.onload = function () {
  //svgRandom.generateRandomRectangle(10);

  const parentElement = document.getElementById('tutorial_svg');
  const bbox = parentElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;
  const totalAreaSvg = width * height;
  console.log(totalAreaSvg);
  intersectElements.polygonIntersectionInSvg(true, 'blue');
  const checkbox = document.getElementById('opacity-test');

  checkbox.addEventListener('input', function () {
    const elements = document.querySelectorAll('.intersect-object');
    const value = this.value;
    elements.forEach(element => {
      element.style.opacity = value;
    });
  });

  document.getElementById('copy').addEventListener('click', function () {
    const container = document.getElementById('tutorial_svg');
    var elementsToCopy = container.querySelectorAll('.area-calculate');
    var copiedContent = '';
    elementsToCopy.forEach(function (element) {
      copiedContent += element.outerHTML + '\n';
    });
    navigator.clipboard.writeText(copiedContent)
      .then(function () {
        alert('Elements copied to clipboard!');
      })
      .catch(function (err) {
        alert('Failed to copy elements: ' + err);
      });
  });
  document.getElementById('generate-btn').addEventListener('click', function() {
    const svgRandom = new svgRandomGenerate('tutorial_svg');
    const numberOfRandomPolygons = document.getElementById('generate-input').value;
    svgRandom.generateRandomRectangle(numberOfRandomPolygons);
  });

};
