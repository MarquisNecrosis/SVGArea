import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

export class svgAreaCalculation{
  constructor(){
  }

  calculateAreaOfAllSvgElements(id){
    const parentElement = document.getElementById(id);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    let totalArea = 0;
    const areaElement = new svgAreaOfSingleElement();
    elementsArray.forEach((element) => {
      totalArea += areaElement.calculateArea(element);
    });
    return totalArea;
  }
}