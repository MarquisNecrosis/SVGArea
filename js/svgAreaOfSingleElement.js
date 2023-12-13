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
    let xCoordinates = [];
    let yCoordinates = [];
    [xCoordinates, yCoordinates] = this.getPolygonCoordinates(polygonElement);
    var calc1 = 0;
    var calc2 = 0;
    for (let index = 0; index < xCoordinates.length - 1; index++) {
      calc1 += xCoordinates[index] * yCoordinates[index + 1];
      calc2 += xCoordinates[index + 1] * yCoordinates[index];
    }
    calc1 += xCoordinates[xCoordinates.length - 1] * yCoordinates[0];
    calc2 += xCoordinates[0] * yCoordinates[xCoordinates.length - 1];
    const area = Math.abs((calc2 - calc1)/2);
    polygonElement.setAttribute('area', area);
    return area;
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

  calculateEllipseArea(ellipseElement) {
    const radiusX = parseFloat(ellipseElement.getAttribute('rx')) || 0;
    const radiusY = parseFloat(ellipseElement.getAttribute('ry')) || 0;
    const area = Math.PI * radiusX * radiusY;
    ellipseElement.setAttribute('area', area);
    return area;
  }

  calcutaUncoveredPartPolygon(element, intersectElements) {
    const numPoints = 10000;
    const elementBBox = element.getBBox();
    let percentageUncover = 0;
    percentageUncover = this.calcutaUncoveredPartPolygonByRandomPoints(element, numPoints, elementBBox, intersectElements)
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