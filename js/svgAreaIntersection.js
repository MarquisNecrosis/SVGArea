import { svgAreaPolygonObject } from "./svgAreaPolygonObject.js";

export class svgAreaIntersection{

  MAX_ITERATION = 1000;
  CIRCLE_LINES = 360;
  EPSILON = 0.0000001

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
    if(isNaN(s) || isNaN(t) || !isFinite(s) || !isFinite(t)){
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
        let allIntersection = this.findAllIntersection(polygon, intersectPolygon);
        console.log(allIntersection);
        let allVertexes = this.findAllVertexes(polygon, intersectPolygon);
        console.log(allVertexes);
        [stat, newPolygon] = this.polygonIntersection(polygon, intersectPolygon);
        allIntersection = this.filterIntersection(allIntersection, newPolygon.points);
        allVertexes = this.filterPoints(allVertexes, newPolygon.points);
        var gap = null;
        if(allVertexes.length > 0){
          [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, allVertexes[0]);
        }
        else if(allIntersection.length > 0){
          [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, null, [allIntersection[0]['intersection'], allIntersection[0]['startPoint']], false);
        }
        this.manageGapsIntersection(polygon, intersectPolygon)
        switch (stat) {
          case this.INTERSECT.ADD:
            polygon.createFromObject(newPolygon, true);
            if(gap != null){
              polygon.createGap(gap);
            }
            console.log(polygon);
            const area = polygon.calculateArea(true, false);
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
      case 'path':
        points = this.getPathCoordinates(element);
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

  getPathCoordinates(pathElement) {
    const d = pathElement.getAttribute('d');
    const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[\-+]?\d+(\.\d+)?(?:[eE][\-+]?\d+)?/g);
    const coord = [];
  
    let currentX = 0;
    let currentY = 0;
  
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
  
      switch (command) {
        case 'M':
          currentX = parseFloat(commands[i + 1]);
          currentY = parseFloat(commands[i + 2]);
          i += 2;
          coord.push([currentX, currentY]);
          break;
        case 'L':
          currentX = parseFloat(commands[i + 1]);
          currentY = parseFloat(commands[i + 2]);
          i += 2;
          coord.push([currentX, currentY]);
          break;
        case 'Q':
          const p0 = [parseFloat(commands[i + 2]), parseFloat(commands[i + 4])];
          const p1 = [parseFloat(commands[i + 1]), parseFloat(commands[i + 2])];
          const p2 = [parseFloat(commands[i + 3]), parseFloat(commands[i + 4])];
          const points = this.splitQuadraticBezier(p0, p1, p2);
          i += 4;
          for (let i = 0; i < points.length; i++) {
            coord.push(points[i]);
          }
          break;
        // Add more cases for other path commands as needed
      }
    }
    return coord;
  }

  polygonIntersection(currentPoints, intersectedPoints, startPoint = null, linePoints = null, clockTurn = true){
    currentPoints instanceof svgAreaPolygonObject;
    if(currentPoints.points.length == 0){
      return [this.INTERSECT.ADD, intersectedPoints];
    }
    else if(intersectedPoints.points.length == 0){
      return [this.INTERSECT.ADD, currentPoints];
    }
    else{
      let swap = false;
      if (startPoint === null && linePoints === null){
        [startPoint, currentPoints, intersectedPoints] = this.setStartPoint(currentPoints, intersectedPoints);
        linePoints = currentPoints.lineFromCurrentIndex();
      }
      else if(linePoints !== null){
        startPoint = linePoints[0];
        currentPoints.index = currentPoints.getIndex(linePoints[1]);
      }
      else {
        currentPoints.index = currentPoints.getIndex(startPoint);
        linePoints = currentPoints.lineFromCurrentIndex();
      }
      let newPolygonPoints = [startPoint];
      let endPoint = [];
      let intersectPolygon = intersectedPoints;
      let it = 0;
      let noIntersection = true;
      while (!this.arraysAreEqual(startPoint, endPoint)) {
        let intersection = null
        intersection = this.checkIfLineHasIntersection(linePoints, intersectPolygon, currentPoints);
        if(intersection == null){
          if(swap){
            [endPoint, linePoints] = this.managePoints(intersectedPoints, intersection);
          }
          else{
            [endPoint, linePoints] = this.managePoints(currentPoints, intersection);
          }
          newPolygonPoints.push(endPoint);
        }
        else{
          newPolygonPoints.push(intersection);
          swap = !swap;
          noIntersection = false;
          if(swap){
            linePoints = intersectedPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = currentPoints;
          }
          else {
            linePoints = currentPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = intersectedPoints;
          }
          if (clockTurn){
            linePoints[0] = intersection;
          }
          else {
            linePoints[1] = intersection;
          }
        }
        it++;
        if(it >= this.MAX_ITERATION){
          break;
        }
      }
      let newPolygon = { ...currentPoints};
      newPolygon.points = newPolygonPoints;
      newPolygon.points.pop();
      if(noIntersection == true && !this.checkIfPolygonIsInsidePolygon(newPolygon, intersectedPoints)){
        return [this.INTERSECT.NEW, intersectedPoints];
      }
      else{
        return [this.INTERSECT.ADD, newPolygon];
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

  checkIfLineHasIntersection(linePoints, intersectedPoints, currentPoints){
    let intersections = [];
    let interPointIndex = [];
    for (let i = 0; i < intersectedPoints.points.length; i++) {
      const intersectLine = intersectedPoints.nextLine(i);
      const intersection = this.lineIntersectionLine(linePoints, intersectLine);
      if (intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(linePoints[0], intersection)){
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
        const intersectLine = intersectedPoints.nextLine(interPointIndex[i]);
        const newDistance = this.calculateDistance(intersectPoint, intersectLine, currentPoints, startPoint)
        if (newDistance < distance){
          distance = newDistance;
          distanceIndex = i;
        }
      }
      if (distance == Number.MAX_VALUE){
        return null;
      }
      else {
        intersectedPoints.index = interPointIndex[distanceIndex];
        return intersections[distanceIndex];
      }
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
      if (Math.abs(arr1[i] - arr2[i]) >= this.EPSILON) {
        return false;
      }
    }
    return true;
  }

  calculateDistance(intersectPoint, intersectLine, currentPoints, startPoint){
    let newDistance = Number.MAX_VALUE;
    if (this.arraysAreEqual(intersectPoint, intersectLine[0]) || this.arraysAreEqual(intersectPoint, intersectLine[1])){
      if (this.arraysAreEqual(intersectPoint, intersectLine[1])){
        intersectLine = [intersectLine[1], intersectLine[0]];
      }
      const isVertex = this.checkIfIsVertex(currentPoints, intersectLine);
      if(isVertex){
        newDistance = Number.MAX_VALUE;
      }
      else{
        newDistance = this.vectorDistance(startPoint, intersectPoint);
      }
    }
    else {
      newDistance = this.vectorDistance(startPoint, intersectPoint);
    }
    return newDistance;
  }

  checkIfIsVertex(currentPoints, intersectLine){
    const startPoint = intersectLine[0];
    let endPoint = intersectLine[1];
    let distance = this.vectorDistance(intersectLine[0], intersectLine[1]);
    for (let i = 0; i < currentPoints.points.length; i++) {
      const line = currentPoints.nextLine(i);
      const intersection = this.lineIntersectionLine(line, intersectLine);
      const newDistance = this.vectorDistance(intersectLine[0], intersection);
      if(!this.arraysAreEqual(intersectLine[0], intersection) && (intersection[0] != null || intersection[1] != null) && newDistance < distance){
        endPoint = intersection;
      }
    }
    const midX = (startPoint[0] + endPoint[0]) / 2;
    const midY = (startPoint[1] + endPoint[1]) / 2;
    const middlePoint = [midX, midY];
    const svgPoint = currentPoints.element.ownerSVGElement.createSVGPoint();
    svgPoint.x = middlePoint[0];
    svgPoint.y = middlePoint[1];
    if (currentPoints.element.isPointInFill(svgPoint)) {
      return true;
    }
    else{
      return false;
    }
  }

  splitQuadraticBezier(p0, p1, p2) {
    const points = [];
  
    for (let t = 1; t <= this.CIRCLE_LINES; t ++) {
      const part = t / this.CIRCLE_LINES;
      const x = (1 - part) * (1 - part) * p0[0] + 2 * (1 - part) * part * p1[0] + part * part * p2[0];
      const y = (1 - part) * (1 - part) * p0[1] + 2 * (1 - part) * part * p1[1] + part * part * p2[1];
  
      points.push([x, y]);
    }
  
    return points;
  }

  checkIfIsPointInFill(point, intersectPolygon){
    const svgPoint = intersectPolygon.element.ownerSVGElement.createSVGPoint();
    svgPoint.x = point[0];
    svgPoint.y = point[1];
    if (intersectPolygon.element.isPointInFill(svgPoint)) {
      return true;
    }
    else{
      return false;
    }
  }

  findAllIntersection(polygon, intersectPolygon) {
    const allIntersection = [];
    for (let i = 0; i < polygon.points.length; i++) {
      for (let j = 0; j < intersectPolygon.points.length; j++) {
        const polygonLine = polygon.nextLine(i);
        const intersectLine = intersectPolygon.nextLine(j);
        const intersection = this.lineIntersectionLine(polygonLine, intersectLine);
        if(intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(intersectLine[0], intersection) && !this.arraysAreEqual(intersectLine[1], intersection)){
          const newIntersection = {
            'intersection': intersection,
            'startPoint': polygonLine[0]
          };
          allIntersection.push(newIntersection);
        }
      }
    }
    return allIntersection;
  }

  findAllVertexes(polygon, intersectPolygon, firstPolygonUse = true, secondPolygonUse = true){
    const allVertexes = [];
    if(firstPolygonUse){
      for (let i = 0; i < polygon.points.length; i++) {
        const polygonPoint = polygon.getPoint(i);
        if (!this.checkIfIsPointInFill(polygonPoint, intersectPolygon)){
          allVertexes.push(polygonPoint);
        }
      }
    }
    if(secondPolygonUse){
      for (let j = 0; j < intersectPolygon.points.length; j++) {
        const intersectPoint = intersectPolygon.getPoint(j);
        if (!this.checkIfIsPointInFill(intersectPoint, polygon)){
          allVertexes.push(intersectPoint);
        }
      }
    }
    return allVertexes;
  }

  filterPoints(points, polygonPoints){
    const filterPoints = [];
    points.forEach(point => {
      let filter = false;
      polygonPoints.forEach(pp => {
        if (Math.abs(point[0] - pp[0]) <= this.EPSILON && Math.abs(point[1] - pp[1]) <= this.EPSILON)
        filter = true;
      });
      if (!filter){
        filterPoints.push(point);
      }
    });
    return filterPoints
  }

  filterIntersection(intersection, polygonPoints){
    const filterPoints = [];
    intersection.forEach(i => {
      let filter = false;
      polygonPoints.forEach(pp => {
        if (Math.abs(i['intersection'][0] - pp[0]) <= this.EPSILON && Math.abs(i['intersection'][1] - pp[1]) <= this.EPSILON){
          filter = true;
        }
      });
      if (!filter){
        filterPoints.push(i);
      }
    });
    return filterPoints
  }

  manageGapsIntersection(polygon, intersectPolygon){
    const gapsToAdd = [];
    const gapsToRemove = [];
    polygon.gaps.forEach((gap, index) => {
      let allIntersection = this.findAllIntersection(gap, intersectPolygon);
      let allVertexes = this.findAllVertexes(gap, intersectPolygon, true, false);
      let stat = null;
      while(allIntersection.length > 0){
        let newGap;
        [stat, newGap] = this.polygonIntersection(gap, intersectPolygon, allVertexes[0], null, true);
        newGap instanceof svgAreaPolygonObject;
        if (!gapsToRemove.includes(index)) {
          gapsToRemove.unshift(index);
        }
        gapsToAdd.push(newGap);
        allIntersection = this.filterIntersection(allIntersection, newGap.points);
        allVertexes = this.filterPoints(allVertexes, newGap.points);
      }
    });
    gapsToRemove.forEach(index => {
      polygon.gaps.splice(index, 1);
    });
    gapsToAdd.forEach((gap, index) => {
      polygon.createGap(gap);
    })
    return polygon;
  }

}