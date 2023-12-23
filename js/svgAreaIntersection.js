import { svgAreaPolygonObject } from "./svgAreaPolygonObject.js";

export class svgAreaIntersection{

  hasfirstIntersection = false;

  constructor(){
    this.currentPolygon = new svgAreaPolygonObject([], 0);
  }

  lineIntersectionLine(line1, line2){
    return this.lineIntersection(line1[0][0], line1[1][0], line1[0][1], line1[1][1], line2[0][0], line2[1][0], line2[0][1], line2[1][1]);
  }

  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){
    let t = ((y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));
    let s = ((x3 - x1) + t * (x4 - x3)) / (x2 - x1);
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      let intersection1 = (x1 + s * (x2 - x1));
      let intersection2 = (y1 + s * (y2 - y1));
      let intersection3 = (x3 + t * (x4 - x3));
      let intersection4 = (y3 + t * (y4 - y3));
      return [intersection1, intersection2];
    }
    else {
      return [null, null];
    }
  }

  polygonIntersectionInSvg(svgID){
    const parentElement = document.getElementById(svgID);
    const elementsWithClass = parentElement.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    elementsArray.forEach(element => {
      const points = this.elementPointTransformation(element);
      const intersectPolygon = new svgAreaPolygonObject(points, 0);
      this.currentPolygon = this.polygonIntersection(this.currentPolygon, intersectPolygon);
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
      return { xCoordinates: [], yCoordinates: [] };
    }
    const points = pointsAttribute.split(/\s+/);
  
    const xCoordinates = [];
    const yCoordinates = [];
  
    points.forEach((point) => {
      const [x, y] = point.split(',').map(parseFloat);
      xCoordinates.push(x);
      yCoordinates.push(y);
    });
  
    return [ xCoordinates, yCoordinates ];
  }

  getRectangleCoordinates(rectangleElement) {
    const x = rectangleElement.getAttribute('x') ? parseFloat(rectangleElement.getAttribute('x')) : 0;
    const y = rectangleElement.getAttribute('y') ? parseFloat(rectangleElement.getAttribute('y')) : 0;
    const width = parseFloat(rectangleElement.getAttribute('width'));
    const height = parseFloat(rectangleElement.getAttribute('height'));
    const xCoordinates = [x, width, width, x];
    const yCoordinates = [y, y, height, height];
    return [ xCoordinates, yCoordinates ];
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
      let newPolygonPoints = startPoint;
      let endPoint = [];
      let currentPointsIndex = 0;
      let intersectedPointsIndex = 0;
      let linePoints = currentPoints.lineFromCurrentIndex();
      while (startPoint !== endPoint) {
        let intersection = null
        if (this.hasfirstIntersection){
          intersection = this.checkIfLineHasIntersection(linePoints, intersectedPoints);
        }
        else {
          intersection = this.checkForFirstIntersection(linePoints, intersectedPoints);
        }
        currentPoints.index++;
        if(intersection == null){
          linePoints = currentPoints.lineFromCurrentIndex();
        }
        break;
      }
    }
  }

  checkIfLineHasIntersection(linePoints, intersectedPoints){
    for (let i = 0; i < intersectedPoints.vectorDimension(); i++) {
      const intersectLine = intersectedPoints.nextLine(i);
      const intersection = this.lineIntersectionLine(linePoints, intersectLine);
      if (intersection[0] != null && intersection[1] != null){
        return intersection;
      }
    }
    return null;
  }

  checkForFirstIntersection(linePoints, intersectedPoints){
    let intersections = [];
    let interPointIndex = [];
    for (let i = 0; i < intersectedPoints.vectorDimension(); i++) {
      const intersectLine = intersectedPoints.nextLine(i);
      console.log(intersectLine);
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