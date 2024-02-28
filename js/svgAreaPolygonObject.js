import { svgAreaOfSingleElement } from './svgAreaOfSingleElement.js';

/**
 * Class for contain vital info aboput polygons and save his html Element
 */
export class svgAreaPolygonObject {

  EPSILON = 0.0000001 //the deviation between two points

  /**
   * 
   * @param {Array} points points of polygons
   * @param {number} index index means, number of point in polygon. 0 is first point, 1 - second...
   * @param {*} parent <svg> parent when html element will be held
   * @param {string} id unique id of polygon, which will his indetified in html
   * @param {boolean} show true = show in html, false = not show 
   * @param {string} color color of polygon in html
   */
  constructor(points, index, parent, id, show = false, color = 'black', path = true) {
    this.points = points;
    this.index = index;
    this.parent = parent;
    this.id = id;
    this.gaps = [];
    if(show){
      this.removeRedundantPoints();
      this.createSvg(show, color);
      this.createPath(color);
    }
  }

  /**
   * Take points from another svgAreaPolygonObject
   * @param {svgAreaPolygonObject} svgAreaPolygonObject 
   * @param {boolean} show 
   */
  createFromObject(svgAreaPolygonObject, show) {
    this.points = svgAreaPolygonObject.points;
    this.removeRedundantPoints();
    this.parent = svgAreaPolygonObject.parent;
    this.redrawSvg(show);
  }

  /**
   * If you want hole inside polygons, than this is define it
   * @param {svgAreaPolygonObject} hole
   */
  createGap(hole) {
    const gap = new svgAreaPolygonObject(hole.points, 0, this.parent, "gap", true, 'white', false);
    let area = gap.calculateArea(false, false, false);
    if (area < 0) {
      gap.reversePoints();
    }
    this.gaps.push(gap);
  }

  /**
   * Create <polygon> base by his points
   * @param {boolean} show show in html
   * @param {string} color background color
   */
  createSvg(show, color) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.element.setAttribute('id', this.id);
    const pointsString = this.points.map(point => point.join(',')).join(' ');
    this.element.setAttribute('points', pointsString);
    this.element.setAttribute('class', 'intersect-object');
    if (true) {
      this.element.setAttribute('stroke', 'gold');
      this.element.setAttribute('stroke-width', '2');
      this.element.setAttribute('fill', color);
      this.element.setAttribute('opacity', 0);
    }
    else {
      this.element.setAttribute('display', 'none');
    }
    this.parent.appendChild(this.element);
  }

  createPath(color) {
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.setAttribute('id', this.id + "_path");
    const pointsString = this.points.map(point => point.join(',')).join(' ');
    let d = "";
    if (this.points.length > 0){
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        if(i == 0){
          d += "M" + point[0] + "," + point[1];
        }
        else{
          d += " L" + point[0] + "," + point[1];
        }
      }
      d += " Z ";
      this.gaps.forEach(gap => {
        if (gap.points.length > 0){
          for (let i = 0; i < gap.points.length; i++) {
            const point = gap.points[i];
            if(i == 0){
              d += "M" + point[0] + "," + point[1];
            }
            else{
              d += " L" + point[0] + "," + point[1];
            }
          }
        }
        d += " Z ";
      });
    }
    this.path.setAttribute('d', d);
    this.path.setAttribute('fill-rule', 'evenodd');
    this.path.setAttribute('class', 'intersect-object');
    if (true) {
      this.path.setAttribute('stroke', 'silver');
      this.path.setAttribute('stroke-width', '2');
      this.path.setAttribute('fill', "blue");
    }
    else {
      this.element.setAttribute('display', 'none');
    }
    this.parent.appendChild(this.path);
  }

  /**
   * Go to another point in polygon
   */
  setNextIndex() {
    this.setIndex(this.index + 1);
  }

  /**
   * Set new index (new point)
   * @param {number} index 
   */
  setIndex(index) {
    this.index = index % (this.points.length);
  }

  /**
   * Return point which is assign to this index. 0 - first point, 1 second...
   * @param {number} index 
   * @returns Point [x, y]
   */
  getPoint(index) {
    index = (this.points.length + index) % (this.points.length);
    return this.points[index];
  }

  /**
   * Return point assign to currentIndex
   * @returns Point [x, y]
   */
  getCurrentPoint() {
    return this.points[this.index];
  }

  /**
   * Return line base by current index. If its index 0 than line is point0 - point1, 1 point1 - point 2...
   * @returns Line Array[[x,y][x,y]]
   */
  lineFromCurrentIndex() {
    return this.nextLine(this.index);
  }

  /**
   * Return line base by index
   * @param {number} index 
   * @returns Line Array[[x,y][x,y]]
   */
  nextLine(index) {
    index = index % (this.points.length);
    if (index == this.points.length - 1) {
      return [this.points[this.points.length - 1], this.points[0]];
    }
    else {
      return [this.points[index], this.points[index + 1]];
    }
  }

  /**
   * Calculate area of polygon
   * @param {boolean} addToParams true = rewrite attribute area with new value, false = only return a value
   * @param {boolean} absolute true - absolute value, false - can be negative value, when the polygon is clockwise oriented
   * @param {boolean} withGaps true = deduct the gaps, false = area without gaps
   * @returns area
   */
  calculateArea(addToParams = true, absolute = true, withGaps = true) {
    const areaElement = new svgAreaOfSingleElement();
    let area = areaElement.calculatePolygonAreaFromPoints(this.points, absolute);
    if (withGaps) {
      this.gaps.forEach(gap => {
        area -= areaElement.calculatePolygonAreaFromPoints(gap.points, absolute);
      });
    }
    if (addToParams) {
      this.area = area;
    }
    return area;
  }

  /**
   * delete polygon from html
   */
  removeSvg() {
    this.parent.removeChild(this.element);
  }

  removePath() {
    this.parent.removeChild(this.path);
    var elements = document.querySelectorAll("#gap_path");
    elements.forEach(function(element) {
      element.parentNode.removeChild(element);
    });
  }

  /**
   * redraw a polygon with new coordination
   * @param {boolean} show 
   */
  redrawSvg(show) {
    this.removeSvg();
    this.createSvg(show);
    this.gaps.forEach(gap => {
      gap.removeSvg();
      gap.createSvg(show, 'white');
    });
    this.removePath()
    this.createPath(show);
  }

  /**
   * Return number of point, if the point not exist, return null
   * @param {Array} point point[x, y]
   * @returns number
   */
  getIndex(point) {
    let i = null
    this.points.forEach(function (element, index) {
      if (element[0] == point[0] && element[1] == point[1]) {
        i = index;
      }
    });
    return i;
  }

  /**
   * Switch clockwise, counter-clockwise orientation of polygon
   */
  reversePoints() {
    let newPoints = [];
    this.points.forEach(point => {
      newPoints.unshift(point);
    });
    this.points = newPoints;
  }

  checkIsPointInFill(point) {
    const svgPoint = this.element.ownerSVGElement.createSVGPoint();
    svgPoint.x = point[0];
    svgPoint.y = point[1];
    return this.element.isPointInFill(svgPoint);
  }

  getAllLines(){
    let lines = [];
    for (let i = 0; i < this.points.length; i++) {
      lines.push(this.nextLine(i));
    }
    return lines;
  }

  /**
   * Remove points which is on the same line. This Points are duplicate and only add time comsuption and can bring some bugs.
   */
  removeRedundantPoints(){
    let pointsToRemove = [];
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const nextPoint = this.getPoint(i + 1);
      const previousPoint = this.getPoint(i - 1);
      const isInside = this.checkIfPointIsInsideVectorPoint(previousPoint, nextPoint, point);
      if(isInside){
        pointsToRemove.unshift(i);
      }
    }
    pointsToRemove.forEach(i => {
      this.points.splice(i, 1);
    });
  }

  /**
   * Find if point is on the same line between startPoint and endPoint
   * @param {*} startPoint 
   * @param {*} endPoint 
   * @param {*} point 
   * @returns true/false
   */
  checkIfPointIsInsideVectorPoint(startPoint, endPoint, point){
    const isInside = this.checkIfPointIsInsideVector(startPoint[0], startPoint[1], endPoint[0], endPoint[1], point[0], point[1]);
    return isInside;
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

}