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
    this.currentPolygon[0] = new svgAreaPolygonObject([], 0, this.parentSVG, "current");
  }

  /**
   * Find intersection of two lines
   * @param {*} line1 Array of two points
   * @param {*} line2 Second array of two points 
   * @returns Array[Number, Number] of intersection, if there isnt any intersection return null
   */
  lineIntersectionLine(line1, line2) {
    return this.lineIntersection(line1[0][0], line1[0][1], line1[1][0], line1[1][1], line2[0][0], line2[0][1], line2[1][0], line2[1][1]);
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
    }
    return [intersection1, intersection2];
  }

  /**
   * Take every svg elements, in svg which is define in constructor and take every elements in this svg which has class "area-calculate"
   */
  polygonIntersectionInSvg() {
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
        if (allVertexes.length > 0) {
          [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, allVertexes[0]);
        }
        else if (allIntersection.length > 0) {
          [stat, gap] = this.polygonIntersection(polygon, intersectPolygon, null, [allIntersection[0]['intersection'], allIntersection[0]['startPoint']], false);
        }
        this.manageGapsIntersection(polygon, intersectPolygon)
        switch (stat) {
          case this.INTERSECT.ADD:
            polygon.createFromObject(newPolygon, true);
            if (gap != null) {
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
      if (!hasIntersection) {
        const area = intersectPolygon.calculateArea();
        console.log(area);
        this.currentPolygon.push(intersectPolygon);
      }
      this.manageCurrentPolygons(indexesForDelete);
    });
    console.log(this.currentPolygon);
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
        linePoints = currentPoints.lineFromCurrentIndex();
      }
      let newPolygonPoints = [startPoint];
      let endPoint = [];
      let intersectPolygon = intersectedPoints;
      let it = 0;
      let noIntersection = true;
      //take points after the new point is not startPoint. If its startPoint that means, that algorhitm take every point around the both polygons and merge is complete
      while (!this.arraysAreEqual(startPoint, endPoint)) {
        let intersection = null
        intersection = this.checkIfLineHasIntersection(linePoints, intersectPolygon, currentPoints);
        //if there is not intersection than take point with current polygon an go on.
        if (intersection == null) {
          if (swap) {
            [endPoint, linePoints] = this.managePoints(intersectedPoints, intersection);
          }
          else {
            [endPoint, linePoints] = this.managePoints(currentPoints, intersection);
          }
          newPolygonPoints.push(endPoint);
        }
        //if there is intersection
        else {
          newPolygonPoints.push(intersection);
          swap = !swap;
          noIntersection = false;
          if (swap) {
            linePoints = intersectedPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = currentPoints;
          }
          else {
            linePoints = currentPoints.lineFromCurrentIndex();
            endPoint = intersection;
            intersectPolygon = intersectedPoints;
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
      }
      let newPolygon = { ...currentPoints };
      newPolygon.points = newPolygonPoints;
      newPolygon.points.pop();
      //if there is no intersection than add new polygon
      if (noIntersection == true && !this.checkIfPolygonIsInsidePolygon(newPolygon, intersectedPoints)) {
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
  checkIfLineHasIntersection(linePoints, intersectedPolygon, currentPolygon) {
    let intersections = [];
    let interPointIndex = [];
    for (let i = 0; i < intersectedPolygon.points.length; i++) {
      const intersectLine = intersectedPolygon.nextLine(i);
      const intersection = this.lineIntersectionLine(linePoints, intersectLine);
      if (intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(linePoints[0], intersection)) {
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
        const intersectLine = intersectedPolygon.nextLine(interPointIndex[i]);
        const newDistance = this.calculateDistance(startPoint, intersectPoint, intersectLine, currentPolygon)
        if (newDistance < distance) {
          distance = newDistance;
          distanceIndex = i;
        }
      }
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
      const svgPoint = intersectedPolygon.element.ownerSVGElement.createSVGPoint();
      const point = currentPolygon.getPoint(i);
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      if (!intersectedPolygon.element.isPointInFill(svgPoint)) {
        startPoint = point;
        break;
      }
    }
    if (startPoint === null) {
      for (let i = 0; i < intersectedPolygon.points.length; i++) {
        intersectedPolygon.index = i;
        const svgPoint = currentPolygon.element.ownerSVGElement.createSVGPoint();
        const point = intersectedPolygon.getPoint(i);
        svgPoint.x = point[0];
        svgPoint.y = point[1];
        if (!currentPolygon.element.isPointInFill(svgPoint)) {
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
  checkIfPolygonIsInsidePolygon(currentPolygon, intersectedPolygon) {
    let isInside = true;
    for (let i = 0; i < intersectedPolygon.points.length; i++) {
      intersectedPolygon.index = i;
      const svgPoint = intersectedPolygon.element.ownerSVGElement.createSVGPoint();
      const point = intersectedPolygon.getPoint(i);
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      if (!currentPolygon.element.isPointInFill(svgPoint)) {
        isInside = false;
        break;
      }
    }
    return isInside;
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
  calculateDistance(fromPoint, toPoint, intersectLine, currentPolygon) {
    let newDistance = Number.MAX_VALUE;
    if (this.arraysAreEqual(toPoint, intersectLine[0]) || this.arraysAreEqual(toPoint, intersectLine[1])) {
      if (this.arraysAreEqual(toPoint, intersectLine[1])) {
        intersectLine = [intersectLine[1], intersectLine[0]];
      }
      const isVertex = this.checkIfIsVertex(currentPolygon, intersectLine);
      if (isVertex) {
        newDistance = Number.MAX_VALUE;
      }
      else {
        newDistance = this.vectorDistance(fromPoint, toPoint);
      }
    }
    else {
      newDistance = this.vectorDistance(fromPoint, toPoint);
    }
    return newDistance;
  }

  /**
   * Check if line is vertex in currentPolygon. So check the first point and last point in intersectLine and define middle Point. If middle point is inside polygon, it is vertex
   * @param {svgAreaPolygonObject} currentPolygon 
   * @param {Array} intersectLine 
   * @returns 
   */
  checkIfIsVertex(currentPolygon, intersectLine) {
    const startPoint = intersectLine[0];
    let endPoint = intersectLine[1];
    let distance = this.vectorDistance(intersectLine[0], intersectLine[1]);
    for (let i = 0; i < currentPolygon.points.length; i++) {
      const line = currentPolygon.nextLine(i);
      const intersection = this.lineIntersectionLine(line, intersectLine);
      const newDistance = this.vectorDistance(intersectLine[0], intersection);
      if (!this.arraysAreEqual(intersectLine[0], intersection) && (intersection[0] != null || intersection[1] != null) && newDistance < distance) {
        endPoint = intersection;
      }
    }
    const midX = (startPoint[0] + endPoint[0]) / 2;
    const midY = (startPoint[1] + endPoint[1]) / 2;
    const middlePoint = [midX, midY];
    const svgPoint = currentPolygon.element.ownerSVGElement.createSVGPoint();
    svgPoint.x = middlePoint[0];
    svgPoint.y = middlePoint[1];
    if (currentPolygon.element.isPointInFill(svgPoint)) {
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
    const svgPoint = intersectPolygon.element.ownerSVGElement.createSVGPoint();
    svgPoint.x = point[0];
    svgPoint.y = point[1];
    if (intersectPolygon.element.isPointInFill(svgPoint)) {
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
  findAllIntersection(polygon, intersectPolygon) {
    const allIntersection = [];
    for (let i = 0; i < polygon.points.length; i++) {
      for (let j = 0; j < intersectPolygon.points.length; j++) {
        const polygonLine = polygon.nextLine(i);
        const intersectLine = intersectPolygon.nextLine(j);
        const intersection = this.lineIntersectionLine(polygonLine, intersectLine);
        if (intersection[0] != null && intersection[1] != null && !this.arraysAreEqual(intersectLine[0], intersection) && !this.arraysAreEqual(intersectLine[1], intersection)) {
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
   * @param {Array} polygonPoints 
   * @returns all points which are not in polygonPoints
   */
  filterPoints(points, polygonPoints) {
    const filterPoints = [];
    points.forEach(point => {
      let filter = false;
      polygonPoints.forEach(pp => {
        if (Math.abs(point[0] - pp[0]) <= this.EPSILON && Math.abs(point[1] - pp[1]) <= this.EPSILON)
          filter = true;
      });
      if (!filter) {
        filterPoints.push(point);
      }
    });
    return filterPoints
  }

  /**
   * Check all points and take only this, which are not in second array of points
   * @param {*} intersection intersection to filter
   * @param {*} polygonPoints 
   * @returns all points which are not in polygonPoints
   */
  filterIntersection(intersection, polygonPoints) {
    const filterPoints = [];
    intersection.forEach(i => {
      let filter = false;
      polygonPoints.forEach(pp => {
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
    const gapsToAdd = [];
    const gapsToRemove = [];
    polygon.gaps.forEach((gap, index) => {
      let allIntersection = this.findAllIntersection(gap, intersectPolygon);
      let allVertexes = this.findAllVertexes(gap, intersectPolygon, true, false);
      let stat = null;
      while (allIntersection.length > 0) {
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