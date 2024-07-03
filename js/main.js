import { svgAreaCalculation } from './svgAreaCalculation.js';
import { svgAreaIntersection } from './svgAreaIntersection.js';
import { svgRandomGenerate } from './svgRandomGenerate.js';

window.onload = function () {

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
  document.getElementById('generatePolygons-btn').addEventListener('click', function() {
    const svgRandom = new svgRandomGenerate('tutorial_svg');
    const numberOfRandomPolygons = document.getElementById('generatePolygons-input').value;
    svgRandom.generateRandomPolygon(numberOfRandomPolygons);
  });
  document.getElementById('lazyAlg-btn').addEventListener('click', function() {
    const startTime = performance.now();
    const areaCalculator = new svgAreaCalculation();
    const area = areaCalculator.lazyStupidAreaCalculation('tutorial_svg');
    document.getElementById('lazyAlg-area').textContent = area + ' px';
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    document.getElementById('lazyAlg-time').textContent = elapsedTime + ' ms';
  });
  document.getElementById('heuristicAlg-btn').addEventListener('click', function() {
    const startTime = performance.now();
    const areaCalculator = new svgAreaCalculation();
    const numberOfRandomPoints = document.getElementById('heuristicAlg-input').value;
    const area = areaCalculator.areaInSvgWithIntersection('tutorial_svg', numberOfRandomPoints);
    document.getElementById('heuristicAlg-area').textContent = area + ' px';
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    document.getElementById('heuristicAlg-time').textContent = elapsedTime + ' ms';
  });
  document.getElementById('SVGAreaAlg-btn').addEventListener('click', function() {
    const startTime = performance.now();
    const intersectElements = new svgAreaIntersection('tutorial_svg');
    const show = document.getElementById('SVGAreaAlg-show').checked;
    const redraw = document.getElementById('SVGAreaAlg-redraw').checked;
    const color = document.getElementById('SVGAreaAlg-color').value;
    const opacity = document.getElementById('SVGAreaAlg-opacity').value;
    const area = intersectElements.polygonIntersectionInSvg(show, redraw, color, opacity);
    document.getElementById('SVGAreaAlg-area').textContent = area + ' px';
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    document.getElementById('SVGAreaAlg-time').textContent = elapsedTime + ' ms';
  });
  document.getElementById('SVGAreaAlg-opacity').addEventListener('input', function () {
    const elements = document.querySelectorAll('.intersect-object');
    const value = this.value;
    elements.forEach(element => {
      element.style.opacity = value;
    });
  });

};
