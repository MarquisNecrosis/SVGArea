import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

/**
 * Class for calculate area for svg element. In <svg> element find every rectangle, polygon, circle,... with class area-calculate and calculate their area.
 * There are only heuristics, which calculate area via random points. It is easy to program, but has it limited precision average 1-5%(must be tested).
 */
export class svgAreaCalculation {

  static LIT_RANDOM_POINTS = 1000; //TODO calculate precision
  static MOD_RANDOM_POINTS = 10000; //TODO calculate precision
  static HIGH_RANDOM_POINTS = 100000; //TODO calculate precision

  constructor() {
  }

  /**
   * Calculate area every element in svg. It takes every point in svg and try to find if point intersect any element or not.
   * @param {string} id <svg> element
   * @returns total area of all elements with intersection in svg
   */
  lazyStupidAreaCalculation(id) {
    const startTime = performance.now();

    const parentElement = document.getElementById(id);
    const childElements = Array.from(parentElement.children);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    let intersectElements = [];
    childElements.forEach((child, index) => {
      const bbox = child.getBBox();
      for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
        for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
          if (!areaElement.isPointIntersect(intersectElements, { 'x': x, 'y': y })) {
            totalArea++;
          }
        }
      }
      intersectElements.push(child);
    });
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log('Function execution time:', elapsedTime, 'milliseconds');
    return totalArea;
  }

  /**
   * Calculate area every element in svg. It takes every element in svg(define by id) and for each element calculate his area. It is ignore intersection.
   * @param {string} id <svg> element
   * @returns total area of all elements without intersection in svg
   */
  areaInSvg(id) {
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.areaOfEllements(elementsWithClass);
    return totalArea;
  }

  /**
   * Calculate area every element in svg. It takes every element in svg(define by id), which has specific class (groupClass) and for each element calculate his area. It is ignore intersection.
   * @param {string} id <svg> element
   * @param {string} groupClass class of element for filtering specific svg elements
   * @returns total area of all elements without intersection in svg
   */
  areaInSvgByGroup(id, groupClass) {
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsWithAttribute = Array.from(elementsWithClass).filter((element) => {
      return element.getAttribute('areagroup') === groupClass;
    });
    const totalArea = this.areaOfEllements(elementsWithAttribute);
    return totalArea;
  }

  /**
   * Calculate area for Collection of elements. Ignore intersection
   * @param {HTMLCollection} svgElements Collection of all elements, for which is area calculate
   * @returns total area of all elements without intersection in svg
   */
  areaOfEllements(svgElements) {
    const elementsArray = Array.from(svgElements);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    elementsArray.forEach((element) => {
      totalArea += areaElement.calculateArea(element);
    });
    return totalArea;
  }

  /**
   * Heuristic which for every svg elements calculate area and than it takes specific number of points and try to find if this point intersect with another element or not.
   * Ratio of points with and without intersection is approximately percentage value of element intersection and this value determines final area.
   * @param {string} id <svg> element
   * @param {number} numberOfRandomPoints count of number of points which is this function take for calculation of area. 
   * You can choose from define constant LIT_RANDOM_POINTS(1000), MOD_RANDOM_POINTS(10000), HIGH_RANDOM_POINTS(10000) or choose your own
   * @returns Approximately area of all elements with intersection
   */
  areaInSvgWithIntersection(id, numberOfRandomPoints = this.LIT_RANDOM_POINTS) {
    const startTime = performance.now();
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.areaOfEllementsWithIntersection(elementsWithClass, numberOfRandomPoints);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log('Function execution time:', elapsedTime, 'milliseconds');
    return totalArea;
  }

  /**
   * Heuristic which for every svg elements calculate area and than it takes specific number of points and try to find if this point intersect with another element or not.
   * Ratio of points with and without intersection is approximately percentage value of element intersection and this value determines final area.
   * @param {string} id <svg> element
   * @param {string} groupClass class of element for filtering specific svg elements
   * @param {number} numberOfRandomPoints count of number of points which is this function take for calculation of area. 
   * You can choose from define constant LIT_RANDOM_POINTS(1000), MOD_RANDOM_POINTS(10000), HIGH_RANDOM_POINTS(10000) or choose your own
   * @returns Approximately area of all elements with intersection
   */
  areaInSvgWithIntersectionByGroup(id, groupClass, numberOfRandomPoints = this.LIT_RANDOM_POINTS) {
    const startTime = performance.now();
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsWithAttribute = Array.from(elementsWithClass).filter((element) => {
      return element.getAttribute('areagroup') === groupClass;
    });
    const totalArea = this.areaOfEllementsWithIntersection(elementsWithAttribute, numberOfRandomPoints);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log('Function execution time:', elapsedTime, 'milliseconds');
    return totalArea;
  }

  /**
   * Heuristic which for every svg elements calculate area and than it takes specific number of points and try to find if this point intersect with another element or not.
   * Ratio of points with and without intersection is approximately percentage value of element intersection and this value determines final area.
   * @param {HTMLCollection} svgElements Collection of all elements, for which is area calculate
   * @param {number} numberOfRandomPoints count of number of points which is this function take for calculation of area. 
   * You can choose from define constant LIT_RANDOM_POINTS(1000), MOD_RANDOM_POINTS(10000), HIGH_RANDOM_POINTS(10000) or choose your own
   * @returns Approximately area of all elements with intersection
   */
  areaOfEllementsWithIntersection(svgElements, numberOfRandomPoints) {
    const elementsArray = Array.from(svgElements);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    let intersectElements = [];
    elementsArray.forEach((element) => {
      const area = areaElement.calculateArea(element);
      const percentageCover = areaElement.calcutaUncoveredPartPolygon(element, intersectElements, numberOfRandomPoints);
      intersectElements.push(element);
      totalArea += area * percentageCover;
    });
    return totalArea;
  }
}