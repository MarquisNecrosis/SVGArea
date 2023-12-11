import { SvgAreaOfSingleElement } from './svgAreaOfSingleElement';

class svgAreaCalculation{
  constructor(){
  }

  calculateAreaOfAllSvgElements(id){
    const svgElements = document.querySelectorAll(`#${id} svg`);
    let totalArea = 0;
    const singleElementAreaCalculator = new SvgAreaOfSingleElement();
    svgElements.forEach((element) => {
      totalArea += singleElementAreaCalculator.calculateArea(element);
    });
  }
}