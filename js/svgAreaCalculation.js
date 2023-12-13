import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

export class svgAreaCalculation{
  constructor(){
  }

  calculateAreaOfAllSvgElements(id){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.calculateAreaOfAllElements(elementsWithClass);
    return totalArea;
  }

  calculateAreaOfAllSvgElementsByGroup(id, groupClass){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsWithAttribute = Array.from(elementsWithClass).filter((element) => {
      return element.getAttribute('areagroup') === groupClass;
    });
    const totalArea = this.calculateAreaOfAllElements(elementsWithAttribute);
    return totalArea;
  }

  calculateAreaOfAllElements(svgElements){
    const elementsArray = Array.from(svgElements);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    elementsArray.forEach((element) => {
      totalArea += areaElement.calculateArea(element);
    });
    return totalArea;
  }

  calculateAreaOfAllSvgElementsWithIntersection(id){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const totalArea = this.calculateAreaOfAllElements(elementsWithClass);
    return totalArea;
  }

  calculateAreaOfAllElementsWithIntersection(id){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    let intersectElements = [];
    elementsArray.forEach((element) => {
      const area = areaElement.calculateArea(element);
      const percentageCover = areaElement.calcutaUncoveredPartPolygon(element, intersectElements);
      intersectElements.push(element);
      totalArea += area * percentageCover;
    });
    return totalArea;
  }
}