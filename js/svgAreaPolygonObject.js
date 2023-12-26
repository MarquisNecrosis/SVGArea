export class svgAreaPolygonObject{
  constructor(points, index){
    this.points = points;
    this.index = index;
  }

  getPoint(index){
    return this.points[index];
  }

  nextPoints(startIndex, endIndex){
    return [this.points.slice(startIndex, endIndex), this.points[1].slice(startIndex, endIndex)];
  }

  lineFromCurrentIndex(){
    return this.nextLine(this.index);
  }

  nextLine(index){
    if(index == this.vectorDimension() - 1){
      return [this.points[this.vectorDimension() - 1], this.points[0]];
    }
    else {
      return [this.points[index], this.points[index + 1]];
    }
  }

  vectorDimension(){
    return this.points.length;
  }
}