class svgAreaOfSingleElement {

  calculateArea(element) {
    const elementType = element.tagName.toLowerCase();
    switch (elementType) {
      case 'rect':
        return this.calculateRectArea(element);
      case 'circle':
        return this.calculateCircleArea(element);
      case 'polygon':
        return this.calculatePolygonArea(element);
      case 'ellipse':
        return this.calculateEllipseArea(element);
      default:
        console.warn(`Unsupported SVG element type: ${elementType}`);
        return 0;
    }
  }

  calculateRectArea(rectElement) {
    const width = parseFloat(rectElement.getAttribute('width')) || 0;
    const height = parseFloat(rectElement.getAttribute('height')) || 0;
    return width * height;
  }

  calculateCircleArea(circleElement) {
    const radius = parseFloat(circleElement.getAttribute('r')) || 0;
    return Math.PI * Math.pow(radius, 2);
  }

  calculatePolygonArea(polygonElement) {

  }

  calculateEllipseArea(ellipseElement) {
    const radiusX = parseFloat(ellipseElement.getAttribute('rx')) || 0;
    const radiusY = parseFloat(ellipseElement.getAttribute('ry')) || 0;
    return Math.PI * radiusX * radiusY;
  }

}