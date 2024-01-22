export class svgAreaOfSingleElement {

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

  calculateRectArea(rectElement) {
    const width = parseFloat(rectElement.getAttribute('width')) || 0;
    const height = parseFloat(rectElement.getAttribute('height')) || 0;
    const area = width * height;
    rectElement.setAttribute('area', area);
    return area;
  }

  calculateCircleArea(circleElement) {
    const radius = parseFloat(circleElement.getAttribute('r')) || 0;
    const area = Math.PI * Math.pow(radius, 2);
    circleElement.setAttribute('area', area);
    return area;
  }

  //Shoelace formula
  calculatePolygonArea(polygonElement) {
    const coord = this.getPolygonCoordinates(polygonElement);
    const area = this.calculatePolygonAreaFromPoints(coord);
    polygonElement.setAttribute('area', area);
    return area;
  }

  calculatePolygonAreaFromPoints(coord){
    var calc1 = 0;
    var calc2 = 0;
    for (let index = 0; index < coord.length - 1; index++) {
      calc1 += coord[index][0] * coord[index + 1][1];
      calc2 += coord[index + 1][0] * coord[index][1];
    }
    calc1 += coord[coord.length - 1][0] * coord[0][1];
    calc2 += coord[0][0] * coord[coord.length - 1][1];
    const area = Math.abs((calc2 - calc1)/2);
    return area;
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

  calcutaUncoveredPartPolygon(element, intersectElements, numberOfRandomPoints) {
    const elementBBox = element.getBBox();
    let percentageUncover = 0;
    percentageUncover = this.calcutaUncoveredPartPolygonByRandomPoints(element, numberOfRandomPoints, elementBBox, intersectElements)
    return percentageUncover;
  }

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

      if (this.isPointInSvgPath(element, randomPoint)) {
        realNumPoints++;
        if(!this.isPointIntersect(intersectElements, randomPoint)){
          pointsWithoutIntersection++;
        }
      }
      step++;
    }
    const percentageUncover = pointsWithoutIntersection/realNumPoints;
    return percentageUncover;
  }

  getRandomPointInBoundingBox(minX, minY, maxX, maxY) {
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    return { x, y };
  }

  isPointIntersect(intersectElements, point){
    let pointIntersect = false;
    intersectElements.forEach((element) => {
      if (this.isPointInSvgPath(element, point)) {
        pointIntersect = true;
        console.log("je");
      }
      else{
        console.log("neni");
      }
    });
    return pointIntersect;
  }

  isPointInSvgPath(intersectElements, point) {
    const svgPoint = intersectElements.ownerSVGElement.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    return intersectElements.isPointInFill(svgPoint);
  }

}