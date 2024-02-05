export class svgAreaOfSingleElement {

  /**
   * Calculate area of element
   * @param {*} element 
   * @returns area
   */
  calculateArea(element) {
    const elementType = element.tagName.toLowerCase();
    let area = 0;
    switch (elementType) {
      case 'rect':
        area = this.calculateRectArea(element);
        break;
      case 'circle':
        area = this.calculateCircleArea(element);
        break;
      case 'polygon':
        area = this.calculatePolygonArea(element);
        break;
      case 'ellipse':
        area = this.calculateEllipseArea(element);
        break;
      case 'path':
        area = this.calculatePathArea(element);
        break;
      default:
        console.warn(`Unsupported SVG element type: ${elementType}`);
        area = 0;
    }
    return area;
  }

  /**
   * Area of rectangle
   * @param {*} rectElement 
   * @returns area
   */
  calculateRectArea(rectElement) {
    const width = parseFloat(rectElement.getAttribute('width')) || 0;
    const height = parseFloat(rectElement.getAttribute('height')) || 0;
    const area = width * height;
    rectElement.setAttribute('area', area);
    return area;
  }

  /**
   * area of circle 
   * @param {*} circleElement 
   * @returns area
   */
  calculateCircleArea(circleElement) {
    const radius = parseFloat(circleElement.getAttribute('r')) || 0;
    const area = Math.PI * Math.pow(radius, 2);
    circleElement.setAttribute('area', area);
    return area;
  }

  /**
   * area of polygon base on Shoelace formula
   * @param {*} polygonElement 
   * @returns area
   */
  calculatePolygonArea(polygonElement) {
    const coord = this.getPolygonCoordinates(polygonElement);
    const area = this.calculatePolygonAreaFromPoints(coord);
    polygonElement.setAttribute('area', area);
    return area;
  }

  /**
   * Shoelace formula
   * @param {Array} coord points
   * @param {boolean} absolute true = absolute value
   * @returns area
   */
  calculatePolygonAreaFromPoints(coord, absolute = true){
    var calc1 = 0;
    var calc2 = 0;
    for (let index = 0; index < coord.length - 1; index++) {
      calc1 += coord[index][0] * coord[index + 1][1];
      calc2 += coord[index + 1][0] * coord[index][1];
    }
    calc1 += coord[coord.length - 1][0] * coord[0][1];
    calc2 += coord[0][0] * coord[coord.length - 1][1];
    if (absolute){
      var area = Math.abs((calc2 - calc1)/2);
    }
    else {
      var area = (calc2 - calc1)/2;
    }
    return area;
  }

  /**
   * Transform points from polygon element into matrix with dimension [m, 2] where m is number of points
   * @param {*} polygonElement 
   * @returns Array[Array[x,y]]
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
   * area of ellipse
   * @param {*} ellipseElement 
   * @returns area
   */
  calculateEllipseArea(ellipseElement) {
    const radiusX = parseFloat(ellipseElement.getAttribute('rx')) || 0;
    const radiusY = parseFloat(ellipseElement.getAttribute('ry')) || 0;
    const area = Math.PI * radiusX * radiusY;
    ellipseElement.setAttribute('area', area);
    return area;
  }

  calculatePathArea(pathElement) {
    const coord = this.getPathCoordinates(pathElement);
    const area = this.calculatePolygonAreaFromPoints(coord);
    pathElement.setAttribute('area', area);
    return area;
  }

  /**
   * Area of path - in test
   * @param {*} pathElement 
   * @returns area
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
          currentX = parseFloat(commands[i + 3]);
          currentY = parseFloat(commands[i + 4]);
          i += 4;
          coord.push([currentX, currentY]);
          break;
        // Add more cases for other path commands as needed
      }
    }
    return coord;
  }

  /**
   * By heuristic it takes numberOfRandomPoints and try it if the point is in intersectElements or not and return ratio
   * @param {*} element 
   * @param {*} intersectElements 
   * @param {number} numberOfRandomPoints 
   * @returns number <0,1>
   */
  calcutaUncoveredPartPolygon(element, intersectElements, numberOfRandomPoints) {
    const elementBBox = element.getBBox();
    let percentageUncover = 0;
    percentageUncover = this.calcutaUncoveredPartPolygonByRandomPoints(element, numberOfRandomPoints, elementBBox, intersectElements)
    return percentageUncover;
  }

  /**
   * This function generate numberOfRandomPoints from elementBBox and try it if the point is in element and intersectElements.
   * If the point is only in element than the point is without intersection
   * If the point is in element and intersectElement than the point is intersect.
   * The function return ratio pointsWithoutIntersection/totalPoints
   * @param {*} element 
   * @param {*} numberOfRandomPoints 
   * @param {*} elementBBox 
   * @param {*} intersectElements 
   * @returns number <0,1>
   */
  calcutaUncoveredPartPolygonByRandomPoints(element, numberOfRandomPoints, elementBBox, intersectElements){
    let realNumPoints = 1;
    let pointsWithoutIntersection = 0;
    let step = 0;
    const MAX_STEPS_FOR_CALCULATE_AREA = 1000000;
    while (realNumPoints < numberOfRandomPoints && step < MAX_STEPS_FOR_CALCULATE_AREA) {
      let randomPoint = this.getRandomPointInBoundingBox(
        elementBBox.x,
        elementBBox.y,
        elementBBox.x + elementBBox.width,
        elementBBox.y + elementBBox.height
      );
      //check if the point is in element, because element does not cover whole bounding box
      if (this.isPointInSvgPath(element, randomPoint)) {
        realNumPoints++;
        //check if the point intersect
        if(!this.isPointIntersect(intersectElements, randomPoint)){
          pointsWithoutIntersection++;
        }
      }
      step++;
    }
    const percentageUncover = pointsWithoutIntersection/realNumPoints;
    return percentageUncover;
  }

  /**
   * Generate random point
   * @param {number} minX 
   * @param {number} minY 
   * @param {number} maxX 
   * @param {number} maxY 
   * @returns Array[x,y]
   */
  getRandomPointInBoundingBox(minX, minY, maxX, maxY) {
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    return { x, y };
  }

  /**
   * Check if the point is inside elements
   * @param {Array} intersectElements element for trying for intersection
   * @param {*} point 
   * @returns true = point intersect at least with one element from intersectElements
   */
  isPointIntersect(intersectElements, point){
    let pointIntersect = false;
    intersectElements.forEach((element) => {
      if (this.isPointInSvgPath(element, point)) {
        pointIntersect = true;
      }
    });
    return pointIntersect;
  }

  /**
   * Check if the point is inside element
   * @param {*} intersectElement 
   * @param {*} point 
   * @returns true = point is inside intersectElement
   */
  isPointInSvgPath(intersectElement, point) {
    const svgPoint = intersectElement.ownerSVGElement.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    return intersectElement.isPointInFill(svgPoint);
  }

}