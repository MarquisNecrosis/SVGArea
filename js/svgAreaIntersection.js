import { svgAreaPolygonObject } from "./svgAreaPolygonObject.js";

export class svgAreaIntersection{

  hasfirstIntersection = false;
  MAX_ITERATION = 1000;

  constructor(){
    this.currentPolygon = new svgAreaPolygonObject([], 0);
  }

  lineIntersectionLine(line1, line2){
    return this.lineIntersection(line1[0][0], line1[0][1], line1[1][0], line1[1][1], line2[0][0], line2[0][1], line2[1][0], line2[1][1]);
  }

  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){
    let intersection1 = null;
    let intersection2 = null;
    let t = 0;
    let s = 0;
    t = ((y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));
    s = ((x3 - x1) + t * (x4 - x3)) / (x2 - x1);
    if(isNaN(s) || isNaN(t)){
      t = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      s = ((y3 - y1) + t * (y4 - y3)) / (y2 - y1);

    }
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      intersection1 = (x1 + s * (x2 - x1));
      intersection2 = (y1 + s * (y2 - y1));
    }
    return [intersection1, intersection2];
  }

  polygonIntersectionInSvg(svgID){
    const parentElement = document.getElementById(svgID);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    elementsArray.forEach(element => {
      const points = this.elementPointTransformation(element);
      const intersectPolygon = new svgAreaPolygonObject(points, 0);
      this.currentPolygon = this.polygonIntersection(this.currentPolygon, intersectPolygon);
      console.log(this.currentPolygon);
    });
  }

  elementPointTransformation(element){
    const elementType = element.tagName.toLowerCase();
    let points = [];
    switch (elementType) {
      case 'rect':
        points = this.getRectangleCoordinates(element);
        break;
      case 'circle':
        break;
      case 'polygon':
        points = this.getPolygonCoordinates(element);
        break;
      case 'ellipse':
        break;
      default:
        console.warn(`Unsupported SVG element type: ${elementType}`);
        points = [];
    }
    return points;
  }

  getPolygonCoordinates(polygonElement) {
    const pointsAttribute = polygonElement.getAttribute('points');
    if (!pointsAttribute) {
      console.error('The polygon element does not have a points attribute.');
      return [];
    }
    const points = pointsAttribute.split(/\s+/);
  
    const coord = [];
  
    points.forEach((point) => {
      const [x, y] = point.split(',').map(parseFloat);
      coord.push([x, y]);
    });
  
    return coord;
  }

  getRectangleCoordinates(rectangleElement) {
    const x = rectangleElement.getAttribute('x') ? parseFloat(rectangleElement.getAttribute('x')) : 0;
    const y = rectangleElement.getAttribute('y') ? parseFloat(rectangleElement.getAttribute('y')) : 0;
    const width = parseFloat(rectangleElement.getAttribute('width'));
    const height = parseFloat(rectangleElement.getAttribute('height'));
    const coord = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
    return coord;
  }

  polygonIntersection(currentPoints, intersectedPoints){
    if(currentPoints.points.length == 0){
      return intersectedPoints;
    }
    else if(intersectedPoints.points.length == 0){
      return currentPoints;
    }
    else{
      const startPoint = currentPoints.getPoint(0);
      let newPolygonPoints = [startPoint];
      let endPoint = [];
      let swap = false;
      let intersectPolygon = intersectedPoints;
      let linePoints = currentPoints.lineFromCurrentIndex();
      let it = 0;
      while (startPoint !== endPoint) {
        let intersection = null
        if (this.hasfirstIntersection){
          intersection = this.checkIfLineHasIntersection(linePoints, intersectPolygon);
        }
        else {
          intersection = this.checkForFirstIntersection(linePoints, intersectPolygon);
        }
        if(intersection == null){
          if(swap){
            intersectedPoints.setNextIndex();
            linePoints = intersectedPoints.lineFromCurrentIndex();
            const nextPoint = intersectedPoints.getPoint(intersectedPoints.index);
            endPoint = nextPoint;
            newPolygonPoints.push(nextPoint);
          }
          else{
            currentPoints.setNextIndex();
            linePoints = currentPoints.lineFromCurrentIndex();
            const nextPoint = currentPoints.getPoint(currentPoints.index);
            endPoint = nextPoint;
            newPolygonPoints.push(nextPoint);
          }
        }
        else{
          this.hasfirstIntersection = true;
          newPolygonPoints.push(intersection);
          swap = !swap;
          if(swap){
            intersectedPoints.setNextIndex();
            linePoints = intersectedPoints.lineFromCurrentIndex();
            intersectPolygon = currentPoints;
            const nextPoint = intersectedPoints.getPoint(intersectedPoints.index);
            endPoint = nextPoint;
            newPolygonPoints.push(nextPoint);
          }
          else {
            currentPoints.setNextIndex();
            linePoints = currentPoints.lineFromCurrentIndex();
            intersectPolygon = intersectedPoints;
            const nextPoint = currentPoints.getPoint(currentPoints.index);
            endPoint = nextPoint;
            newPolygonPoints.push(nextPoint);
          }
        }
        it++;
        if(it >= this.MAX_ITERATION){
          break;
        }
      }
      return newPolygonPoints;
    }
  }

  checkIfLineHasIntersection(linePoints, intersectedPoints){
    for (let i = 0; i < intersectedPoints.points.length; i++) {
      const intersectLine = intersectedPoints.lineFromCurrentIndex();
      const intersection = this.lineIntersectionLine(linePoints, intersectLine);
      if (intersection[0] != null && intersection[1] != null){
        return intersection;
      }
      intersectedPoints.setNextIndex();
    }
    return null;
  }

  checkForFirstIntersection(linePoints, intersectedPoints){
    let intersections = [];
    let interPointIndex = [];
    for (let i = 0; i < intersectedPoints.points.length; i++) {
      const intersectLine = intersectedPoints.nextLine(i);
      const intersection = this.lineIntersectionLine(linePoints, intersectLine);
      if (intersection[0] != null && intersection[1] != null){
        intersections.push(intersection);
        interPointIndex.push(i);
      }
    }
    if (intersections != null) {
      let distance = Number.MAX_VALUE;
      const startPoint = [linePoints[0][0], linePoints[1][0]];
      let distanceIndex = 0;
      for (let i = 0; i < intersections.length; i++) {
        const intersectPoint = intersections[i];
        const newDistance = this.vectorDistance(startPoint, intersectPoint);
        if (newDistance < distance){
          distance = newDistance;
          distanceIndex = i;
        }
      }
      intersectedPoints.index = interPointIndex[distanceIndex];
      return intersections[distanceIndex];
    }
    else {
      return null;
    }
  }

  vectorDistance(vector1, vector2){
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensionality');
    }
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
  }
}