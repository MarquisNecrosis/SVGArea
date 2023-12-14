import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

export class svgAreaCalculation{

  static LIT_RANDOM_POINTS = 10000;
  static MOD_RANDOM_POINTS = 100000;
  static HIGH_RANDOM_POINTS = 1000000;

  constructor(){
  }

  areaInSvg(id){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.areaOfEllements(elementsWithClass);
    return totalArea;
  }

  areaInSvgByGroup(id, groupClass){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsWithAttribute = Array.from(elementsWithClass).filter((element) => {
      return element.getAttribute('areagroup') === groupClass;
    });
    const totalArea = this.areaOfEllements(elementsWithAttribute);
    return totalArea;
  }

  areaOfEllements(svgElements){
    const elementsArray = Array.from(svgElements);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    elementsArray.forEach((element) => {
      totalArea += areaElement.calculateArea(element);
    });
    return totalArea;
  }

  areaInSvgWithIntersection(id, numberOfRandomPoints = this.LIT_RANDOM_POINTS){
    const startTime = performance.now();
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.areaOfEllementsWithIntersection(elementsWithClass, numberOfRandomPoints);
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    console.log('Function execution time:', elapsedTime, 'milliseconds');
    return totalArea;
  }

  areaInSvgWithIntersectionByGroup(id, groupClass, numberOfRandomPoints = this.LIT_RANDOM_POINTS){
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

  areaOfEllementsWithIntersection(svgElements, numberOfRandomPoints){
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