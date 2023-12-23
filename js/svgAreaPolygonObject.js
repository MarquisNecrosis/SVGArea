export class svgAreaPolygonObject{
  constructor(points, index){
    this.points = points;
    this.index = index;
  }

  getPoint(index){
    return [this.points[0][index], this.points[1][index]];
  }

  pointsSlice(startIndex, endIndex){
    return [this.points[0].slice(startIndex, endIndex), this.points[1].slice(startIndex, endIndex)];
  }

  pointsEndStart(){
    return [[this.points[0][this.vectorDimension() - 1], this.points[0][0]], [this.points[1][this.vectorDimension() - 1], this.points[1][0]]]
  }

  lineFromCurrentIndex(){
    return this.nextLine(this.index);
  }

  nextLine(index){
    if(index == this.vectorDimension() - 1){
      return this.pointsEndStart();
    }
    else {
      return this.pointsSlice(index, index + 2);
    }
  }

  vectorDimension(){
    return this.points[0].length;
  }
}