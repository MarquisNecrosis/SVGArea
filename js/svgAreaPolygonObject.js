import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

export class svgAreaPolygonObject{
  constructor(points, index, parent, id, show = false, color = 'black'){
    this.points = points;
    this.index = index;
    this.parent = parent;
    this.id = id;
    this.createSvg(show, color);
    this.gaps = [];
  }

  createFromObject(svgAreaPolygonObject, show){
    this.points = svgAreaPolygonObject.points;
    this.parent = svgAreaPolygonObject.parent;
    this.redrawSvg(show);
  }

  createGap(hole){
    const gap = new svgAreaPolygonObject(hole.points, 0, this.parent, "gap", true, 'white');
    this.gaps.push(gap);
  }

  createSvg(show, color){
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.element.setAttribute('id', this.id);
    const pointsString = this.points.map(point => point.join(',')).join(' ');
    this.element.setAttribute('points', pointsString);
    if(true){
      this.element.setAttribute('stroke', 'gold');
      this.element.setAttribute('stroke-width', '2');
      this.element.setAttribute('fill', color);
    }
    else{
      this.element.setAttribute('display', 'none');
    }
    this.parent.appendChild(this.element);
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

  getCurrentPoint(){
    return this.points[this.index];
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
    this.gaps.forEach(gap => {
      this.area -= areaElement.calculatePolygonAreaFromPoints(gap.points);
    });
    return this.area;
  }

  removeSvg(){
    this.parent.removeChild(this.element);
  }

  redrawSvg(show){
    this.removeSvg();
    this.createSvg(show);
    this.gaps.forEach(gap => {
      gap.removeSvg;
      gap.createSvg(show, 'white');
    });
  }

  getIndex(point){
    let i = null
    this.points.forEach(function(element, index) {
      if(element[0] == point[0] && element[1] == point[1]){
        i = index;
      }
    });
    return i;
  }

}