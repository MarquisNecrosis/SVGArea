import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

export class svgAreaPolygonObject{
  constructor(points, index, parent){
    this.points = points;
    this.index = index;
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.element.setAttribute('points', points);
    parent.appendChild(this.element);
  }

  setNextIndex(){
    this.setIndex(this.index + 1);
  }

  setIndex(index){
    this.index = index % (this.points.length);
  }

  getPoint(index){
    index = index % (this.points.length);
    return this.points[index];
  }

  nextPoints(startIndex, endIndex){
    return [this.points.slice(startIndex, endIndex), this.points[1].slice(startIndex, endIndex)];
  }

  lineFromCurrentIndex(){
    return this.nextLine(this.index);
  }

  nextLine(index){
    index = index % (this.points.length);
    if(index == this.points.length - 1){
      return [this.points[this.points.length - 1], this.points[0]];
    }
    else {
      return [this.points[index], this.points[index + 1]];
    }
  }

  calculateArea(){
    const areaElement = new svgAreaOfSingleElement();
    this.area = areaElement.calculatePolygonAreaFromPoints(this.points);
    return this.area;
  }

}