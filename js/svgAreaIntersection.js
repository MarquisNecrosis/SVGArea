import { svgAreaPolygonObject } from "./svgAreaPolygonObject.js";

export class svgAreaIntersection{

  MAX_ITERATION = 1000;
  CIRCLE_LINES = 360;

  INTERSECT = {
    ADD: 1,
    NEW: 2
  }

  constructor(svgID){
    this.parentSVG = document.getElementById(svgID);
    this.currentPolygon = [];
    this.currentPolygon[0] = new svgAreaPolygonObject([], 0, this.parentSVG, "current");
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

  polygonIntersectionInSvg(){
    const elementsWithClass = this.parentSVG.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    elementsArray.forEach(element => {
      const points = this.elementPointTransformation(element);
      let intersectPolygon = new svgAreaPolygonObject(points, 0, this.parentSVG, "intersect", false);
      let hasIntersection = false;
      let indexesForDelete = [];
      let indexForDelete = -1;
      this.currentPolygon.forEach((polygon, index) => {
        let newPolygon = null;
        let stat = 0;
        [stat, newPolygon] = this.polygonIntersection(polygon, intersectPolygon);
        switch (stat) {
          case this.INTERSECT.ADD:
            polygon.createFromObject(newPolygon, true);
            console.log(polygon);
            const area = polygon.calculateArea();
            console.log(area);
            intersectPolygon.removeSvg();
            intersectPolygon = polygon;
            if (hasIntersection) {
              indexesForDelete.push(indexForDelete);
            }
            hasIntersection = true;
            indexForDelete = index;
            break;
          case this.INTERSECT.NEW:
            break;
          default:
            break;
        }
      });
      if (!hasIntersection){
        const area = intersectPolygon.calculateArea();
        console.log(area);
        this.currentPolygon.push(intersectPolygon);
      }
      this.manageCurrentPolygons(indexesForDelete);
    });
    console.log(this.currentPolygon);
  }

  elementPointTransformation(element){
    const elementType = element.tagName.toLowerCase();
    let points = [];
    switch (elementType) {
      case 'rect':
        points = this.getRectangleCoordinates(element);
        break;
      case 'circle':
        points = this.getCircleCoordinates(element);
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

  getCircleCoordinates(circleElement) {
    const radius = parseInt(circleElement.getAttribute('r'));
    const centerX = parseInt(circleElement.getAttribute('cx'));
    const centerY = parseInt(circleElement.getAttribute('cy'));
    const angleIncrement = (2 * Math.PI) / this.CIRCLE_LINES;
    const coord = [];
    for (let i = 0; i < this.CIRCLE_LINES; i++) {
      const angle = i * angleIncrement;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      coord.push([x, y]);
    }
    return coord;
  }

  polygonIntersection(currentPoints, intersectedPoints){
    if(currentPoints.points.length == 0){
      return [this.INTERSECT.ADD, intersectedPoints];
    }
    else if(intersectedPoints.points.length == 0){
      return [this.INTERSECT.ADD, currentPoints];
    }
    else{
      let startPoint = [];
      let swap = false;
      [startPoint, currentPoints, intersectedPoints] = this.setStartPoint(currentPoints, intersectedPoints);
      let newPolygonPoints = [startPoint];
      let endPoint = [];
      let intersectPolygon = intersectedPoints;
      let linePoints = currentPoints.lineFromCurrentIndex();
      let it = 0;
      let noIntersection = true;
      while (startPoint !== endPoint) {
        let intersection = null
        intersection = this.checkIfLineHasIntersection(linePoints, intersectPolygon);
        if(intersection == null){
          if(swap){
            [endPoint, linePoints] = this.managePoints(intersectedPoints, intersection);
          }
          else{
            [endPoint, linePoints] = this.managePoints(currentPoints, intersection);
          }
        }
        else{
          newPolygonPoints.push(intersection);
          swap = !swap;
          noIntersection = false;
          if(swap){
            [endPoint, linePoints] = this.managePoints(intersectedPoints, intersection);
            intersectPolygon = currentPoints;
          }
          else {
            [endPoint, linePoints] = this.managePoints(currentPoints, intersection);
            intersectPolygon = intersectedPoints;
          }
        }
        newPolygonPoints.push(endPoint);
        it++;
        if(it >= this.MAX_ITERATION){
          break;
        }
      }
      currentPoints.points = newPolygonPoints;
      if(noIntersection == true && !this.checkIfPolygonIsInsidePolygon(currentPoints, intersectedPoints)){
        return [this.INTERSECT.NEW, intersectedPoints];
      }
      else{
        return [this.INTERSECT.ADD, currentPoints];
      }
    }
  }

  managePoints(points, intersection){
    points.setNextIndex();
    let nextPoint = points.getCurrentPoint();
    while(this.arraysAreEqual(nextPoint, intersection)){
      points.setNextIndex();
      nextPoint = points.getCurrentPoint();
    }
    const linePoints = points.lineFromCurrentIndex();
    return [nextPoint, linePoints];
  }

  checkIfLineHasIntersection(linePoints, intersectedPoints){
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
    if (intersections.length > 0) {
      let distance = Number.MAX_VALUE;
      const startPoint = [linePoints[0][0], linePoints[0][1]];
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

  setStartPoint(currentPoints, intersectedPoints){
    let startPoint = null;
    for (let i = 0; i < currentPoints.points.length; i++) {
      currentPoints.index = i;
      const svgPoint = intersectedPoints.element.ownerSVGElement.createSVGPoint();
      const point = currentPoints.getPoint(i);
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      if (!intersectedPoints.element.isPointInFill(svgPoint)){
        startPoint = point;
        break;
      }
    }
    if (startPoint === null) {
      for (let i = 0; i < intersectedPoints.points.length; i++) {
        intersectedPoints.index = i;
        const svgPoint = currentPoints.element.ownerSVGElement.createSVGPoint();
        const point = intersectedPoints.getPoint(i);
        svgPoint.x = point[0];
        svgPoint.y = point[1];
        if (!currentPoints.element.isPointInFill(svgPoint)) {
          startPoint = point;
          const pom = currentPoints;
          currentPoints = intersectedPoints;
          intersectedPoints = pom;
          break;
        }
      }
    }
    return [startPoint, currentPoints, intersectedPoints];
  }

  checkIfPolygonIsInsidePolygon(currentPoints, intersectedPoints){
    let isInside = true;
    for (let i = 0; i < intersectedPoints.points.length; i++) {
      intersectedPoints.index = i;
      const svgPoint = intersectedPoints.element.ownerSVGElement.createSVGPoint();
      const point = intersectedPoints.getPoint(i);
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      if (!currentPoints.element.isPointInFill(svgPoint)){
        isInside = false;
        break;
      }
    }
    return isInside;
  }

  manageCurrentPolygons(indexesToDelete){
    indexesToDelete.sort((a, b) => b - a);
    indexesToDelete.forEach(index => {
      this.currentPolygon.splice(index, 1);
    });
    this.currentPolygon.forEach(function(element, index) {
      element.id = 'current_' + index;
    });
  }

  arraysAreEqual(arr1, arr2) {
    if (arr1 === null || arr1 === undefined || arr2 === null || arr2 === undefined) {
      return false;
    }
      if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }
}