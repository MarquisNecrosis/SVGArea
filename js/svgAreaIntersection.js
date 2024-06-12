import { svgAreaPolygonObject } from "./svgAreaPolygonObject.js";

/**
 * Class for calculate area of polygons
 */
export class svgAreaIntersection {

  MAX_ITERATION = 1000; //after 1000 steps the program shutdown
  CIRCLE_LINES = 360; //how many pieces the circle
  EPSILON = 0.0000001 //the deviation between two points

  INTERSECT = {
    ADD: 1,
    NEW: 2
  }

  /**
   * Konstruktor
   * @param {string} svgID id of <svg>
   */
  constructor(svgID) {
    this.parentSVG = document.getElementById(svgID);
    this.currentPolygon = [];
    this.currentPolygon[0] = new svgAreaPolygonObject([], 0, this.parentSVG, "current", true);
  }

  /**
   * Find intersection of two lines
   * @param {*} line1 Array of two points
   * @param {*} line2 Second array of two points 
   * @returns Array[Number, Number] of intersection, if there isnt any intersection return null
   */
  lineIntersectionLine(line1, line2, checkInsideLines) {
    let intersection = this.lineIntersection(line1[0][0], line1[0][1], line1[1][0], line1[1][1], line2[0][0], line2[0][1], line2[1][0], line2[1][1]);
    if (checkInsideLines && intersection[0] == null && intersection[1] == null){
      const inside1 = this.checkIfPointIsInsideVectorLine(line2, line1[0]);
      const inside2 = this.checkIfPointIsInsideVectorLine(line2, line1[1]);
      if (inside1 && inside2){
        intersection = line1[1];
      }
    }
    return intersection;
  }

  /**
   * Find intersection of two lines, decompose on axis coordination
   * @param {number} x1 x-axis coord of first point first line
   * @param {number} y1 y-axis coord of first point first line
   * @param {number} x2 x-axis coord of second point first line
   * @param {number} y2 y-axis coord of second point first line
   * @param {number} x3 x-axis coord of first point second line
   * @param {number} y3 y-axis coord of first point second line
   * @param {number} x4 x-axis coord of second point second line
   * @param {number} y4 y-axis coord of second point second line
   * @returns Array[Number, Number] of intersection, if there isnt any intersection return null
   */
  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    let intersection1 = null;
    let intersection2 = null;
    let t = 0;
    let s = 0;
    t = ((y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));
    s = ((x3 - x1) + t * (x4 - x3)) / (x2 - x1);
    if (isNaN(s) || isNaN(t) || !isFinite(s) || !isFinite(t)) {
      t = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      s = ((y3 - y1) + t * (y4 - y3)) / (y2 - y1);
    }
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      intersection1 = (x1 + s * (x2 - x1));
      intersection2 = (y1 + s * (y2 - y1));
      intersection1 = Math.round(intersection1 * 10000000000) / 10000000000;
      intersection2 = Math.round(intersection2 * 10000000000) / 10000000000;
    }
    const isInside = this.checkIfPointIsInsideVector(x1, y1, x2, y2, x3, y3);
    if(intersection1 == null && intersection2 == null && isInside){
      intersection1 = x3;
      intersection2 = y3;
    }  
    return [intersection1, intersection2];
  }

  distance(x1, y1, x2, y2){
    const distance = Math.sqrt(Math.pow(x1 - x2) + Math.pow(y1 - y2));
    return distance;
  }

  isBetween(x1, y1, x2, y2, x3, y3){
    const distance1 = this.distance(x1, y1, x3, y3);
    const distance2 = this.distance(x3, y3, x2, y2);
    const distance3 = this.distance(x1, y1, x2, y2);
    const sumDistance = Math.abs(distance1 + distance2 + distance3);
    if(sumDistance < this.EPSILON){
      return true
    }
    else{
      return false;
    }
  }

  checkIfPointIsInsideVector(x1, y1, x2, y2, x3, y3) {
    let isInside = true;
    let crossproduct  = (y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1);
    if (Math.abs(crossproduct) > this.EPSILON){
      isInside = false;
    }
    let dotproduct = (x3 - x1) * (x2 - x1) + (y3 - y1)*(y2 - y1);
    if(dotproduct < 0){
      isInside = false;
    }
    let squaredlengthba = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1);
    if (dotproduct > squaredlengthba){
      isInside = false;
    }
    return isInside;
  }

  checkIfPointIsInsideVectorPoint(startPoint, endPoint, point){
    const isInside = this.checkIfPointIsInsideVector(startPoint[0], startPoint[1], endPoint[0], endPoint[1], point[0], point[1]);
    return isInside;
  }

  checkIfPointIsInsideVectorLine(line, point){
    const isInside = this.checkIfPointIsInsideVectorPoint(line[0], line[1], point);
    return isInside;
  }

  /**
   * Take every svg elements, in svg which is define in constructor and take every elements in this svg which has class "area-calculate"
   */
  polygonIntersectionInSvg() {
    const elementsWithClass = this.parentSVG.getElementsByClassName('area-calculate');
    const elementsArray = Array.from(elementsWithClass);
    elementsArray.forEach(element => {
      const points = this.elementPointTransformation(element);
      let intersectPolygon = new svgAreaPolygonObject(points, 0, this.parentSVG, "intersect", true);
      let hasIntersection = false;
      let indexesForDelete = [];
      let indexForDelete = -1;
      console.log("novy polygon");
      console.log(intersectPolygon);
      this.currentPolygon.forEach((polygon, index) => {
        console.log("prunik s polygonem");
        let newPolygon = null;
        let stat = 0;
        let allIntersection = this.findAllIntersection(polygon, intersectPolygon);
        let allVertexes = this.findAllVertexes(polygon, intersectPolygon);
        let allVertexesIntersect = this.findAllVertexes(polygon, intersectPolygon, false);
        [stat, newPolygon] = this.polygonIntersection(polygon, intersectPolygon);
        allIntersection = this.filterIntersection(allIntersection, newPolygon);
        allVertexes = this.filterPoints(allVertexes, newPolygon);
        allVertexesIntersect = this.filterPoints(allVertexesIntersect, newPolygon);
        this.manageGapsIntersection(polygon, intersectPolygon);
        const gapsIntersection = this.manageGapsIntersection(intersectPolygon, polygon);
        if (gapsIntersection){
          stat = this.INTERSECT.ADD;
        }
        allVertexes = this.filterGapsPoints(allVertexes, polygon);
        allVertexesIntersect = this.filterGapsPoints(allVertexesIntersect, polygon);
        polygon.redrawSvg(true);

        let gaps = [];
        while(allVertexes.length > 0 && stat == this.INTERSECT.ADD) {
          let gap = null;
          console.log("vznika nova dira");
          let clockTurn = true;
          if (allVertexesIntersect.length > 0){
            clockTurn = true;
            [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, allVertexesIntersect[0], null, clockTurn);
          }
          else{
            [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, allVertexes[0], null, clockTurn);
          }
          allIntersection = this.filterIntersection(allIntersection, gap);
          allVertexes = this.filterPoints(allVertexes, gap);
          allVertexesIntersect = this.filterPoints(allVertexesIntersect, gap);
          gaps.push(gap);
        }
        if (allIntersection.length > 0) {
          let gap = null
          console.log("vznika nova dira bez vrcholu");
          [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, null, [allIntersection[0]['intersection'], allIntersection[0]['startPoint']], false);
          gaps.push(gap);
        }
        switch (stat) {
          case this.INTERSECT.ADD:
            polygon.createFromObject(newPolygon, true, intersectPolygon);
            gaps.forEach(gap => {
              if (gap != null) {
                polygon.createGap(gap);
                polygon.chooseCorrectGap();
                polygon.redrawSvg(true);
              }   
            });
            const area = polygon.calculateArea(true, false);
            intersectPolygon.removeSvg();
            intersectPolygon.removePath();
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
      if (!hasIntersection) {
        const area = intersectPolygon.calculateArea();
        this.currentPolygon.push(intersectPolygon);
      }
      this.manageCurrentPolygons(indexesForDelete);
    });
  }

  /**
   * Take an element and return his points in svg.
   * @param {*} element svg element
   * @returns points from element
   */
  elementPointTransformation(element) {
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

  /**
   * Take points from attribute points insereted into matrix [m, 2] whem m is number of points in polygon
   * @param {polygon} polygonElement 
   * @returns Array[Array[number, number]]
   */
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

  /** 
   * Function calculate points from rectangle via attributes x, y, width and height and return matrix of points in dimension [4,2]
   * @param {rectangle} rectangleElement 
   * @returns Array[Array[number, number]]
   */
  getRectangleCoordinates(rectangleElement) {
    const x = rectangleElement.getAttribute('x') ? parseFloat(rectangleElement.getAttribute('x')) : 0;
    const y = rectangleElement.getAttribute('y') ? parseFloat(rectangleElement.getAttribute('y')) : 0;
    const width = parseFloat(rectangleElement.getAttribute('width'));
    const height = parseFloat(rectangleElement.getAttribute('height'));
    const coord = [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
    return coord;
  }

  /**
   * Function calculate points from circle separate into (default 360) pieces and return it in matrix in dimension [m, 2]
   * @param {circle} circleElement 
   * @returns Array[Array[number, number]]
   */
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

  /**
   * Take coordination and added into Matrix with dimension [m, 2], where m is number of points. If path has any round parts, than this parts are separate into small pieces (default 360) and added into matrix.
   * @param {path} pathElement 
   * @returns Array[Array[number, number]]
   */
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

  /**
   * Function which merge two polygons together. If its dont have merge, than only add new polygons to another polygons
   * @param {svgAreaIntersection} currentPoints first polygon, which is as original
   * @param {svgAreaPolygonObject} intersectedPoints intersected polygon
   * @param {Array} startPoint you can define start position, where you start in algorhitm. If its null than algorhitm choose startPoint automatically. If you choose starPoint manually the algorhitm can work incorrectly
   * @param {*} linePoints you can define start line Array [[x1, y1], [x2, y2]], one user define startPoint, than one of the points must be startPoint, or the algorhitm can work incorrectly. If its null than its choose automatically.
   * @param {boolean} clockTurn true - take point by clockwise, false - take point by counter-clockwise
   * @returns 
   */
  polygonIntersection(currentPoints, intersectedPoints, startPoint = null, linePoints = null, clockTurn = true) {
    currentPoints instanceof svgAreaPolygonObject;
    //if the first polygon is without points, than only merge polygon, is second
    if (currentPoints.points.length == 0) {
      return [this.INTERSECT.ADD, intersectedPoints];
    }
    //if the second polygon is without points, than only merge polygon, is first
    else if (intersectedPoints.points.length == 0) {
      return [this.INTERSECT.ADD, currentPoints];
    }
    else {
      let swap = false;
      //automatically find startPoint and linePoints
      if (startPoint === null && linePoints === null) {
        [startPoint, currentPoints, intersectedPoints] = this.setStartPoint(currentPoints, intersectedPoints);
        linePoints = currentPoints.lineFromCurrentIndex();
      }
      //if exist linePoints than startPoint is automatically first point of linePoints 
      else if (linePoints !== null) {
        startPoint = linePoints[0];
        currentPoints.index = currentPoints.getIndex(linePoints[1]);
      }
      //startPoint and linePoints is set
      else {
        currentPoints.index = currentPoints.getIndex(startPoint);
        if (currentPoints.index == null){
          let pom = currentPoints;
          currentPoints = intersectedPoints;
          intersectedPoints = pom;
          currentPoints.index = currentPoints.getIndex(startPoint);
        }
        linePoints = currentPoints.lineFromCurrentIndex();
      }
      let newPolygonPoints = [startPoint];
      this.addSVGPointWithClass(startPoint);
      let endPoint = [];
      let intersectPolygon = intersectedPoints;
      let currentPolygon = currentPoints;
      let it = 0;
      let noIntersection = true;
      this.highlightLinePoints(linePoints);
      let lastPoint = null;
      //take points after the new point is not startPoint. If its startPoint that means, that algorhitm take every point around the both polygons and merge is complete
      while (!this.arraysAreEqual(startPoint, endPoint)) {
        let intersection = null
        intersection = this.checkIfLineHasIntersection(linePoints, intersectPolygon, currentPolygon, lastPoint);
        //if there is not intersection than take point with current polygon an go on.
        if (intersection == null) {
          if (swap) {
            [endPoint, linePoints] = this.managePoints(intersectedPoints, intersection);
          }
          else {
            [endPoint, linePoints] = this.managePoints(currentPoints, intersection);
          }
          newPolygonPoints.push(endPoint);
          this.addSVGPointWithClass(endPoint);
        }
        //if there is intersection
        else {
          swap = !swap;
          noIntersection = false;
          newPolygonPoints.push(intersection);
          this.addSVGPointWithClass(intersection);
          if (swap) {
            linePoints = intersectedPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = currentPoints;
            currentPolygon = intersectedPoints;
          }
          else {
            linePoints = currentPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = intersectedPoints;
            currentPolygon = currentPoints;
          }
          if (clockTurn) {
            linePoints[0] = intersection;
          }
          else {
            linePoints[1] = intersection;
          }
        }
        it++;
        if (it >= this.MAX_ITERATION) {
          break;
        }
        this.highlightLinePoints(linePoints);
        lastPoint = newPolygonPoints[newPolygonPoints.length - 1];
      }
      this.highlightLinePoints(null);
      let newPolygon = { ...currentPoints };
      newPolygon.points = newPolygonPoints;
      this.deleteHelpPoints();
      newPolygon.points.pop();
      //if there is no intersection than add new polygon
      if (noIntersection == true && this.checkIfPolygonIsOutsidePolygon(currentPoints, intersectedPoints)) {
        return [this.INTERSECT.NEW, intersectedPoints];
      }
      else {
        return [this.INTERSECT.ADD, newPolygon];
      }
    }
  }

  /**
   * Find next point from polygon
   * @param {svgAreaPolygonObject} points polygon as object
   * @param {Array} intersection Point of intersection, can be null
   * @returns [nextPoint = another point which in polygon, linePoints = another line base of nextPoint]
   */
  managePoints(polygon, intersection) {
    polygon.setNextIndex();
    let nextPoint = polygon.getCurrentPoint();
    while (this.arraysAreEqual(nextPoint, intersection)) {
      polygon.setNextIndex();
      nextPoint = polygon.getCurrentPoint();
    }
    const linePoints = polygon.lineFromCurrentIndex();
    return [nextPoint, linePoints];
  }

  /**
   * Find intersected between line and intersectedPolygon, if there is not intersection than return null.
   * @param {Array} linePoints [x, y] - point of line, which is use for finding intersection.
   * @param {svgAreaPolygonObject} intersectedPolygon
   * @param {svgAreaPolygonObject} currentPolygon 
   * @returns intersection [number, number] or null
   */
  checkIfLineHasIntersection(linePoints, intersectedPolygon, currentPolygon, lastPoint) {
    const [intersections, interPointIndex] = this.findAllIntersectionBetweenLineLineAndPolygon(linePoints, intersectedPolygon, currentPolygon, lastPoint);
    const intersection = this.findNearesIntersection(intersections, interPointIndex, currentPolygon, linePoints, intersectedPolygon);
    return intersection;
  }

  /**
   * Find all intersection between line and polygon
   * @param {*} linePoints Line for trying finding all intersection
   * @param {*} intersectedPolygon intersected polygon
   * @param {*} currentPolygon 
   * @param {*} lastPoint check for duplication.
   * @returns 
   */
  findAllIntersectionBetweenLineLineAndPolygon(linePoints, intersectedPolygon, currentPolygon, lastPoint) {
    let intersections = [];
    let interPointIndex = [];
    let banishedIntersection = [];
    for (let i = 0; i < intersectedPolygon.points.length; i++) {
      let intersectLine = intersectedPolygon.nextLine(i);
      this.highlightIntersectLinePoints(intersectLine);
      const isColinear = this.checkIfLinesIsColinear(linePoints, intersectLine);
      const sameDirection = this.checkIfLinesHasSameDirection(linePoints, intersectLine);
      if (isColinear && sameDirection) {
        if(!this.arraysAreEqual(linePoints[1], intersectLine[1])) {
          if (!this.arraysAreEqual(linePoints[1], lastPoint) && this.checkIfPointIsInsideVectorLine(intersectLine, linePoints[1])) {
            const isVertex = this.checkIfIsVertex(currentPolygon, [linePoints[1], intersectLine[1]], linePoints, linePoints[1]);
            if(!isVertex) {
              intersections.push(linePoints[1]);
              interPointIndex.push(i);
            }
          }
          else {
            const isInside = this.checkIfPointIsInsideVectorLine(linePoints, intersectLine[0]);
            if(isInside) {
              intersections.push(intersectLine[0]);
              interPointIndex.push(i);
            }
          }
        }
        else {
          banishedIntersection.push(intersectLine[1]);
        }
      }
      else if (isColinear && !sameDirection && this.arraysAreEqual(linePoints[1], intersectLine[1])){
        banishedIntersection.push(intersectLine[1]);
      }
      else {
        const intersection = this.lineIntersectionLine(linePoints, intersectLine, true);
        let isVertex = false;
        if (this.arraysAreEqual(intersection, intersectLine[0]) || this.arraysAreEqual(intersection, intersectLine[1])) {
          const startPoint = [linePoints[0][0], linePoints[0][1]];
          if (this.arraysAreEqual(startPoint, intersectLine[0]) || this.arraysAreEqual(intersection, intersectLine[1])) {
            intersectLine = [intersectLine[1], intersectLine[0]];
            continue;
          }
          isVertex = this.checkIfIsVertex(currentPolygon, intersectLine, linePoints, intersection);
        } 
        if (intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(linePoints[0], intersection) && !isVertex) {
          intersections.push(intersection);
          interPointIndex.push(i);
        }
        const isInside = this.checkIfPointIsInsideVectorLine(intersectLine, linePoints[1]);
        if (isInside) {
          intersections.push(linePoints[1]);
          interPointIndex.push(i);
        }
      }
    }

    [intersections, interPointIndex] = this.removeBanishedIntersection(intersections, interPointIndex, banishedIntersection);
    [intersections, interPointIndex] = this.removeRedundandsIntersection(intersections, interPointIndex);
    this.highlightIntersectLinePoints(null);
    return [intersections, interPointIndex];
  }

  checkIfLinesIsColinear(linePoints, intersectLine) {
    const colinear1 = this.areCollinear(linePoints[0], linePoints[1], intersectLine[0]);
    const colinear2 = this.areCollinear(linePoints[0], linePoints[1], intersectLine[1]);
    const isInside1 = this.checkIfPointIsInsideVectorLine(linePoints, intersectLine[0]);
    const isInside2 = this.checkIfPointIsInsideVectorLine(linePoints, intersectLine[1]);
    const isInside3 = this.checkIfPointIsInsideVectorLine(intersectLine, linePoints[0]);
    const isInside4 = this.checkIfPointIsInsideVectorLine(intersectLine, linePoints[1]);
    const colinear = colinear1 && colinear2 && (isInside1 || isInside2 || isInside3 || isInside4);
    return colinear;
  }

  checkIfLinesHasSameDirection(linePoints, intersectLine) {
    const dir1 = this.directionVector(linePoints[0], linePoints[1]);
    const dir2 = this.directionVector(intersectLine[0], intersectLine[1]);
    const dotProduct = dir1[0] * dir2[0] + dir1[1] * dir2[1];
    if (dotProduct < 0) {
        return false;
    }
    return true;
  }

  directionVector(point1, point2) {
    return [point2[0] - point1[0], point2[1] - point1[1]];
  }

  areCollinear(p1, p2, p3) {
    return (p2[1] - p1[1]) * (p3[0] - p2[0]) === (p3[1] - p2[1]) * (p2[0] - p1[0]);
}

  findNearesIntersection(intersections, interPointIndex, currentPolygon, linePoints, intersectedPolygon) {
    if (intersections.length > 0) {
      let distance = Number.MAX_VALUE;
      const startPoint = [linePoints[0][0], linePoints[0][1]];
      let distanceIndex = 0;
      for (let i = 0; i < intersections.length; i++) {
        const intersectPoint = intersections[i];
        const intersectLine = intersectedPolygon.nextLine(interPointIndex[i]);
        this.highlightIntersectLinePoints(intersectLine);
        const newDistance = this.calculateDistance(startPoint, intersectPoint, intersectLine, currentPolygon, linePoints, intersectedPolygon)
        if (newDistance < distance) {
          distance = newDistance;
          distanceIndex = i;
        }
      }
      this.highlightIntersectLinePoints(null);
      if (distance == Number.MAX_VALUE) {
        return null;
      }
      else {
        intersectedPolygon.index = interPointIndex[distanceIndex];
        return intersections[distanceIndex];
      }
    }
    else {
      return null;
    }
  }

  /**
   * Calcute distance between two vectors
   * @param {Array} vector1 
   * @param {Array} vector2 
   * @returns Distance
   */
  vectorDistance(vector1, vector2) {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensionality');
    }
    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
      sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Set start point for merging polygon. It take point by point and check it, if it is not fill in intersect polygon. When it find return it. Otherwise start check point in intersectedPolygon and switch the two polygons
   * @param {svgAreaPolygonObject} currentPolygon First polyogon, which is original.
   * @param {svgAreaPolygonObject} intersectedPolygon Second polygon. If the algorhitm doesnt find any point than try find in this one
   * @returns [startPoint = first point which is not in fill in another polygon, currentPolygon, intersectedPolygon] - if the algorhitm must find startPoint in intersectedPolygon than it swap this polygons
   */
  setStartPoint(currentPolygon, intersectedPolygon) {
    let startPoint = null;
    for (let i = 0; i < currentPolygon.points.length; i++) {
      currentPolygon.index = i;
      const point = currentPolygon.getPoint(i);
      if (!intersectedPolygon.checkIsPointInFill(point)) {
        startPoint = point;
        break;
      }
    }
    if (startPoint === null) {
      for (let i = 0; i < intersectedPolygon.points.length; i++) {
        intersectedPolygon.index = i;
        const point = intersectedPolygon.getPoint(i);
        if (!currentPolygon.checkIsPointInFill(point)) {
          startPoint = point;
          const pom = currentPolygon;
          currentPolygon = intersectedPolygon;
          intersectedPolygon = pom;
          break;
        }
      }
    }
    return [startPoint, currentPolygon, intersectedPolygon];
  }

  /**
   * Function check if every points from currentPolygon are inside intersectedPolygon
   * @param {svgAreaPolygonObject} currentPolygon 
   * @param {svgAreaPolygonObject} intersectedPolygon 
   * @returns true = every points from currentPolygon are inside intersectedPolygon
   */
  checkIfPolygonIsOutsidePolygon(currentPolygon, intersectedPolygon) {
    let isOutside = true;
    for (let i = 0; i < intersectedPolygon.points.length; i++) {
      intersectedPolygon.index = i;
      const point = intersectedPolygon.getPoint(i);
      if (currentPolygon.checkIsPointInFill(point)) {
        if (!currentPolygon.checkIfPointIsInLineOfPolygon(point)) {
          isOutside = false;
          break;
        }
      }
    }
    return isOutside;
  }

  /**
   * Function delete every polygon by index and remove it from svg
   * @param {Array} indexesToDelete 
   */
  manageCurrentPolygons(indexesToDelete) {
    indexesToDelete.sort((a, b) => b - a);
    indexesToDelete.forEach(index => {
      this.currentPolygon.splice(index, 1);
    });
    this.currentPolygon.forEach(function (element, index) {
      element.id = 'current_' + index;
    });
  }

  /**
   * Check if the arrays are same
   * @param {Array} arr1 
   * @param {Array} arr2 
   * @returns true = array has same dimension and same value
   */
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

  /**
   * Calculate distance between fromPoint to toPoint. If intersectLine is a vertex, than the points has distance infinite. 
   * That prevent when intersection is only vertex of the second polygon, but the line is in fill currentPolygon. 
   * This points are not valid intersection
   * @param {Array} fromPoint Point from which i want start calcute distance
   * @param {Array} toPoint End Point to I want calculate distance
   * @param {Array} intersectLine Line which intersect currentPolygon
   * @param {svgAreaPolygonObject} currentPolygon the polygon on which are locate fromPoint, toPoint and intersectLine
   * @returns distance between fromPoint to toPoint
   */
  calculateDistance(fromPoint, toPoint, intersectLine, currentPolygon, linePoints, intersectedPolygon) {
    let newDistance = Number.MAX_VALUE;
    newDistance = this.vectorDistance(fromPoint, toPoint);
    return newDistance;
  }

  /**
   * Check if line is vertex in currentPolygon. So check the first point and last point in intersectLine and define middle Point. If middle point is inside polygon, it is vertex
   * @param {svgAreaPolygonObject} currentPolygon 
   * @param {Array} intersectLine 
   * @returns 
   */
  checkIfIsVertex(currentPolygon, intersectLine, linePoints, intersection) {
    const startPoint = intersection;
    let endPoint = intersectLine[1];
    let distance = this.vectorDistance(intersectLine[0], intersectLine[1]);
    let intersectEndPoint = endPoint;
    let pomLine;
    let hasAnotherIntersection = false;
    for (let i = 0; i < currentPolygon.points.length; i++) {
      const line = currentPolygon.nextLine(i);
      const intersection = this.lineIntersectionLine(line, intersectLine, true);
      const newDistance = this.vectorDistance(intersectLine[0], intersection);
      if (!this.arraysAreEqual(intersectLine[0], intersection) && (intersection[0] != null || intersection[1] != null) && newDistance < distance) {
        endPoint = intersection;
        intersectEndPoint = line[1];
        pomLine = line;
        hasAnotherIntersection = true;
        distance = newDistance;
      }
    }
    const midX = (startPoint[0] + endPoint[0]) / 2;
    const midY = (startPoint[1] + endPoint[1]) / 2;
    const middlePoint = [midX, midY];
    const isInside = this.checkIfPointIsInsideVectorLine(linePoints, middlePoint);
    const inFill = currentPolygon.checkIsPointInFillForGaps(middlePoint);
    if(inFill && !isInside) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * Split bezier curve into 360 pieces.
   * @param {Array} p0 
   * @param {Array} p1 
   * @param {Array} p2 
   * @returns Return points from bezier curve
   */
  splitQuadraticBezier(p0, p1, p2) {
    const points = [];

    for (let t = 1; t <= this.CIRCLE_LINES; t++) {
      const part = t / this.CIRCLE_LINES;
      const x = (1 - part) * (1 - part) * p0[0] + 2 * (1 - part) * part * p1[0] + part * part * p2[0];
      const y = (1 - part) * (1 - part) * p0[1] + 2 * (1 - part) * part * p1[1] + part * part * p2[1];

      points.push([x, y]);
    }

    return points;
  }

  /**
   * Check if the point is inside polygon
   * @param {Array} point point to investigate
   * @param {svgAreaPolygonObject} intersectPolygon 
   * @returns true if point is inside polygon
   */
  checkIfIsPointInFill(point, intersectPolygon) {
    if (intersectPolygon.checkIsPointInFill(point)) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * Find all intersection between two polygons
   * @param {*} polygon 
   * @param {*} intersectPolygon 
   * @returns Array of all intersect points
   */
  findAllIntersection(polygon, intersectPolygon, swap = false) {
    let allIntersection = [];
    const banishedIntersection = [];
    for (let i = 0; i < polygon.points.length; i++) {
      for (let j = 0; j < intersectPolygon.points.length; j++) {
        const polygonLine = polygon.nextLine(i);
        let intersectLine = intersectPolygon.nextLine(j);
        const intersection = this.lineIntersectionLine(polygonLine, intersectLine, true);
        if (intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(polygonLine[0], intersection)) {
          if (this.arraysAreEqual(intersection, intersectLine[1])) {
            intersectLine = [intersectLine[1], intersectLine[0]];
          }
          const isInCorner = polygon.points.some(subArray => subArray[0] === intersection[0] && subArray[1] === intersection[1])
          const isVertex = this.checkIfIsVertex(polygon, intersectLine, polygonLine, intersection);
          if (swap){
            var newIntersection = {
              'intersection': intersection,
              'startPoint': polygonLine[1]
            };
          }
          else{
            var newIntersection = {
              'intersection': intersection,
              'startPoint': polygonLine[0]
            };
          }
          if (!isVertex && !isInCorner){
            allIntersection.push(newIntersection);             
          }
          else {
            banishedIntersection.push(newIntersection);
          }
        }
      }
    }
    allIntersection = allIntersection.filter(item => {
      // Check if the intersection of the current item exists in banishedIntersection
      return !banishedIntersection.some(banishedItem =>
          JSON.stringify(banishedItem.intersection) === JSON.stringify(item.intersection)
      );
    });
    return allIntersection;
  }

  /**
   * Find all vertexes, which are not fill in the another polygon
   * @param {svgAreaPolygonObject} polygon 
   * @param {svgAreaPolygonObject} intersectPolygon 
   * @param {boolean} firstPolygonUse true = find vertexes from first polygon
   * @param {boolean} secondPolygonUse true = find vertexes from second polygon
   * @returns Array of all vertexes points
   */
  findAllVertexes(polygon, intersectPolygon, firstPolygonUse = true, secondPolygonUse = true) {
    const allVertexes = [];
    if (firstPolygonUse) {
      for (let i = 0; i < polygon.points.length; i++) {
        const polygonPoint = polygon.getPoint(i);
        if (!this.checkIfIsPointInFill(polygonPoint, intersectPolygon)) {
          allVertexes.push(polygonPoint);
        }
      }
    }
    if (secondPolygonUse) {
      for (let j = 0; j < intersectPolygon.points.length; j++) {
        const intersectPoint = intersectPolygon.getPoint(j);
        if (!this.checkIfIsPointInFill(intersectPoint, polygon)) {
          allVertexes.push(intersectPoint);
        }
      }
    }
    return allVertexes;
  }

  /**
   * Check all points and take only this, which are not in second array of points
   * @param {Array} points points to filter
   * @param {Array} polygon 
   * @returns all points which are not in polygonPoints
   */
  filterPoints(points, polygon) {
    polygon = this.castIntosvgAreaPolygonObject(polygon);
    const filterPoints = [];
    points.forEach(point => {
      let filter = false;
      polygon.points.forEach(pp => {
        if (Math.abs(point[0] - pp[0]) <= this.EPSILON && Math.abs(point[1] - pp[1]) <= this.EPSILON)
          filter = true;
      });
      const lines = polygon.getAllLines();
      lines.forEach(line => {
        const isInside = this.checkIfPointIsInsideVectorLine(line, point); {
          if (isInside){
            filter = true;
          }
        }
      });
      if (!filter) {
        filterPoints.push(point);
      }
    });
    return filterPoints
  }

  filterGapsPoints(points, polygon){
    polygon = this.castIntosvgAreaPolygonObject(polygon);
    polygon.gaps.forEach(gap => {
      points = this.filterPoints(points, gap);
    });
    return points;
  }

  /**
   * Check all points and take only this, which are not in second array of points
   * @param {*} intersection intersection to filter
   * @param {*} polygon 
   * @returns all points which are not in polygonPoints
   */
  filterIntersection(intersection, polygon) {
    polygon = this.castIntosvgAreaPolygonObject(polygon);
    const filterPoints = [];
    intersection.forEach(i => {
      let filter = false;
      polygon.points.forEach(pp => {
        if (Math.abs(i['intersection'][0] - pp[0]) <= this.EPSILON && Math.abs(i['intersection'][1] - pp[1]) <= this.EPSILON) {
          filter = true;
        }
      });

      if (!filter) {
        filterPoints.push(i);
      }
    });
    return filterPoints
  }

  /**
   * Check if the intersectPolygon doesnt change gaps inside polygon and manage it.
   * @param {svgAreaPolygonObject} polygon 
   * @param {svgAreaPolygonObject} intersectPolygon 
   * @returns polygon with potencially change gaps
   */
  manageGapsIntersection(polygon, intersectPolygon) {
    let intersect = false;
    let gapsToAdd = [];
    let gapsToRemove = [];
    let gapsToAddFromIntersect = [];
    [gapsToRemove, gapsToAdd] = this.gapsIntersection(polygon, intersectPolygon);
    [, gapsToAddFromIntersect] = this.gapsIntersection(intersectPolygon, polygon);
    gapsToRemove.forEach(index => {
      polygon.gaps[index].removeSvg();
      polygon.gaps.splice(index, 1);
    });
    gapsToAdd.forEach((gap, index) => {
      if(!polygon.gaps.includes(gap)){
        polygon.createGap(gap);
        intersect = true;
      }
    })
    gapsToAddFromIntersect.forEach((gap, index) => {
      if(!polygon.gaps.includes(gap)){
        polygon.createGap(gap);
        intersect = true;
      }
    })
    return intersect;
  }

  gapsIntersection(polygon, intersectPolygon){
    let gapsToAdd = [];
    let gapsToRemove = [];
    polygon.gaps.forEach((gap, index) => {
      console.log("prunik mezi dirami polygonu a novym polygonem");
      console.log(gap);
      let allIntersection = this.findAllIntersection(gap, intersectPolygon, true);
      let allVertexes = this.findAllVertexes(gap, intersectPolygon, true, false);
      let stat = null;
      if(allIntersection.length == 0 && allVertexes.length == 0){
        console.log("zadny prunik neni");
        if (!gapsToRemove.includes(index)) {
          gapsToRemove.unshift(index);
        }
      }
      else if (allIntersection.length > 0) {
        console.log("prunik je mezi dirou a polygonem je");
        gapsToAdd = this.intersectGap(allIntersection, allVertexes, gap, intersectPolygon, gapsToAdd);
        if (!gapsToRemove.includes(index)) {
          gapsToRemove.unshift(index);
        }
      }
    });
    return [gapsToRemove, gapsToAdd];
  }

  /**
   * In while loop the algorhitm check all intersection between gap and intersectPolygon and transform gap into new shape or new pieces.
   * @param {Array} allIntersection all intersection between gap and intersectPoly
   * @param {*} allVertexes All gaps vertexes which are not part of intersect polygon
   * @param {svgAreaPolygonObject} gap 
   * @param {svgAreaPolygonObject} intersectPolygon 
   * @param {Array} gapsToAdd Array of all new gaps
   * @returns new gaps
   */
  intersectGap(allIntersection, allVertexes, gap, intersectPolygon, gapsToAdd) {
    let it = 0;
    while (allIntersection.length > 0) {
      let newGap;
      if (allVertexes.length > 0){
        console.log("prunik je mezi dirou a polygonem je a je startovni bod");
        [, newGap] = this.polygonIntersection(gap, intersectPolygon, allVertexes[0], null, true);
      }
      else {
        console.log("prunik je mezi dirou a polygonem je a NENI startovni bod");
        [, newGap] = this.polygonIntersection(gap, intersectPolygon, null, [allIntersection[0]['intersection'], allIntersection[0]['startPoint']], true);
      }
      newGap instanceof svgAreaPolygonObject;
      gapsToAdd.push(newGap);
      allIntersection = this.filterIntersection(allIntersection, newGap);
      allVertexes = this.filterPoints(allVertexes, newGap);
      it++;
      if (it >= this.MAX_ITERATION) {
        break;
      }
    }
    return gapsToAdd;
  }

  castIntosvgAreaPolygonObject(obj){
    let svg = new svgAreaPolygonObject();
    return Object.assign(svg, obj);
  }

  arrayIncludesArray(arrayOfArrays, comparisonArray){
    let equal = false;
    arrayOfArrays.forEach(innerArray => {
      const isEqual = innerArray.every((value, index) => value === comparisonArray[index]); 
      if (isEqual) {
        equal = true;
      }
    });
    return equal;
  }

  addSVGPointWithClass(point) {
    // Create a new SVG point
    var svgNS = "http://www.w3.org/2000/svg";
    var newPoint = document.createElementNS(svgNS, "circle");
    
    // Set attributes for the point
    newPoint.setAttribute("cx", point[0]);
    newPoint.setAttribute("cy", point[1]);
    newPoint.setAttribute("r", "5");
    newPoint.setAttribute("class", "helpPoints"); // Add the class 'point'
    
    // Append the point to the SVG
    document.getElementById("tutorial_svg").appendChild(newPoint);
  }

  deleteHelpPoints() {
    var elements = document.getElementsByClassName("helpPoints");
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  /**
   * Remove redundant intersections base on duplication
   * @param {*} intersections 
   * @param {*} interPointIndex index of polygon which has intersection
   * @returns 
   */
  removeRedundandsIntersection(intersections, interPointIndex) {
    const duplicateIndexes = [];
    const uniqueIntersect = [];
    const uniqueInterPointIndex = [];
    let lengthOfIntersections = intersections.length;
    if (intersections.length > 1) {
      if (this.arraysAreEqual(intersections[intersections.length - 1], intersections[0])){
        uniqueIntersect.push(intersections[intersections.length - 1]);
        lengthOfIntersections--;
      }
    }
    for (let i = 0; i < lengthOfIntersections; i++) {
      const intersection = intersections[i];
      const pointIndex = interPointIndex[i];
      let isDuplicate = false;
      for (let j = 0; j < uniqueIntersect.length; j++) {
        const intersect = uniqueIntersect[j];
        if (this.arraysAreEqual(intersection, intersect)){
          duplicateIndexes.push(i);
          isDuplicate = true;
        }
      }
      if (!isDuplicate) {
        uniqueIntersect.push(intersection);
        uniqueInterPointIndex.push(pointIndex);
      }
    }


    for (let i = duplicateIndexes.length - 1; i >= 0; i--) {
      intersections.splice(duplicateIndexes[i], 1);
      interPointIndex.splice(duplicateIndexes[i], 1);
    }
    return [intersections, interPointIndex];
  }

  /**
   * 
   * @param {*} intersections Array of intersection
   * @param {*} interPointIndex array of index of intersection
   * @param {*} banishedIntersection array of intersection which we wont remove
   * @returns 
   */
  removeBanishedIntersection(intersections, interPointIndex, banishedIntersection) {
    const banishedIndexes = [];
    let lengthOfIntersections = intersections.length;
    for (let i = 0; i < lengthOfIntersections; i++) {
      const intersection = intersections[i];
      for (let j = 0; j < banishedIntersection.length; j++) {
        const intersect = banishedIntersection[j];
        if (this.arraysAreEqual(intersection, intersect)){
          banishedIndexes.push(i);
        }
      }
    }

    for (let i = banishedIndexes.length - 1; i >= 0; i--) {
      intersections.splice(banishedIndexes[i], 1);
      interPointIndex.splice(banishedIndexes[i], 1);
    }
    return [intersections, interPointIndex];
  }

  highlightLinePoints(linePoints) {
    var elements = document.getElementsByClassName("helpLine");
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
    if(linePoints != null){
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",linePoints[0][0]);
      line.setAttribute("y1", linePoints[0][1]);
      line.setAttribute("x2", linePoints[1][0]);
      line.setAttribute("y2", linePoints[1][1]);
      line.setAttribute("stroke", "red");
      line.setAttribute("stroke-width", "8");
      line.setAttribute("class", "helpLine");
      document.getElementById("tutorial_svg").appendChild(line);
    }
  }

  highlightIntersectLinePoints(linePoints) {
    var elements = document.getElementsByClassName("helpIntersectLine");
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
    if(linePoints != null){
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1",linePoints[0][0]);
      line.setAttribute("y1", linePoints[0][1]);
      line.setAttribute("x2", linePoints[1][0]);
      line.setAttribute("y2", linePoints[1][1]);
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", "8");
      line.setAttribute("class", "helpIntersectLine");
      document.getElementById("tutorial_svg").appendChild(line);
    }
  }


}