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
  constructor(points, index, parent, id, show = false, color = 'black', element = null, path = null) {
    this.points = points;
    this.index = index;
    this.parent = parent;
    this.id = id;
    this.isGap = false;
    this.parentPath = null;
    this.gaps = [];
    this.area = 0;
    if(show){
      this.removeRedundantPoints();
      if (element == null){
        this.createSvg(show, color);
      }
      else {
        this.element = element;
      }
      if (path == null){
        this.createPath(color);
      }
      else{
        this.path = path;
      }
    }
  }

  /**
   * Take points from another svgAreaPolygonObject
   * @param {svgAreaPolygonObject} svgAreaPolygonObject 
   * @param {boolean} show 
   */
  createFromObject(svgAreaPolygonObject, show, intersectPolygon) {
    this.points = svgAreaPolygonObject.points;
    this.gaps = this.gaps.concat(intersectPolygon.gaps);
    this.removeDuplicateGaps();
    this.removeRedundantPoints();
    this.parent = svgAreaPolygonObject.parent;
    this.redrawSvg(show);
  }

  removeDuplicateGaps(){
    const uniqueArray = [];
    this.gaps.forEach((value) => {
      let existing = false;
      uniqueArray.forEach(element => {
        if (this.arrayIncludesArray(value.points, element.points)){
          existing = true;
        }
      });
      if (!existing) {
        uniqueArray.push(value);
      }
    });
    this.gaps = uniqueArray;
  }

  /**
   * If you want hole inside polygons, than this is define it
   * @param {svgAreaPolygonObject} hole
   */
  createGap(hole) {
    const gap = new svgAreaPolygonObject(hole.points, 0, this.parent, "gap", true, 'white');
    gap.isGap = true;
    gap.parentPath = this.path;
    gap.parentPoints = this.points;
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
    this.element.setAttribute('opacity', 0);
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
    if (index < 0){
      index = this.points.length + index;
    }
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
    if (this.points.length > 0){
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
    else {
      return 0;
    }
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
    let area = this.calculateArea(false, false, false);
    if(area > 0) {
      this.reversePoints();
    }
    this.createSvg(show);
    this.removePath()
    this.createPath(show);
    this.gaps.forEach(gap => {
      gap.removeSvg();
      gap.createSvg(show, 'white');
      gap.parentPath = this.path;
      gap.parentPoints = this.points
    });
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
    if (this.isGap){
      var svgPoint = this.parentPath.ownerSVGElement.createSVGPoint();
    }
    else {
      var svgPoint = this.path.ownerSVGElement.createSVGPoint();
    }
    svgPoint.x = point[0];
    svgPoint.y = point[1];
    return this.path.isPointInFill(svgPoint);
  }

  /**
   * If there is gaps than check for parent, because gaps has no fill and must be check fort parents
   * @param {*} point 
   * @returns 
   */
  checkIsPointInFillForGaps(point) {
    let inFill = false;
    if (this.isGap){
      var svgPoint = this.parentPath.ownerSVGElement.createSVGPoint();
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      inFill = this.parentPath.isPointInFill(svgPoint);
    }
    else {
      var svgPoint = this.path.ownerSVGElement.createSVGPoint();
      svgPoint.x = point[0];
      svgPoint.y = point[1];
      inFill = this.path.isPointInFill(svgPoint);
    }
    return inFill;
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
    this.removeDuplicatePoints();
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

  checkIfPointIsInsideVectorLine(line, point){
    const isInside = this.checkIfPointIsInsideVectorPoint(line[0], line[1], point);
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
   * Correct the gaps and main polygon, sometimes during algorhitm the gaps can be main polygon, because in gaps start startPoint. 
   * In this case, there is tool, which looked on every point in main polygon, if every point from main polygon are in gap, than switch polygon and gap
   * @returns 
   */
  chooseCorrectGap() {
    for (let index = 0; index < this.gaps.length; index++) {
      const gap = this.gaps[index];
      const isOutside = this.checkIfPolygonIsOutsidePolygon(gap, this);
      if(!isOutside) {
        console.log('Inside');
        const newGapPoints = this.points;
        const newGapElement = this.element;
        const newGapPath = this.path;
        const newGapArea = this.area;
        this.points = gap.points;
        let area = this.calculateArea(false, false, false);
        if(area > 0) {
          this.reversePoints();
        }
        this.element = gap.element;
        this.path = gap.path;
        this.area = gap.area;
        gap.points = newGapPoints;
        let gapArea = gap.calculateArea(false, false, false);
        if (gapArea < 0) {
          gap.reversePoints();
        }
        gap.element = newGapElement;
        newGapPath.id = 'gap_path';
        gap.path = newGapPath;
        gap.area = newGapArea;
        return;
      }
    }
  }

  checkIfPolygonIsOutsidePolygon(currentPolygon, intersectedPolygon) {
    let isOutside = true;
    for (let i = 0; i < intersectedPolygon.points.length; i++) {
      intersectedPolygon.index = i;
      const point = intersectedPolygon.getPoint(i);
      if (currentPolygon.checkIsPointInFill(point)) {
        isOutside = false;
        break;
      }
    }
    return isOutside;
  }

  checkIfPointIsInLineOfPolygon(point) {
    const allLines = this.getAllLines();
    let isInside = false;
    for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
      isInside = this.checkIfPointIsInsideVectorLine(line, point);
      if(isInside){
        isInside = true;
        break;
      }
    }
    return isInside;
  }

  checkIfPointIsVertex(point) {
    let isVertex = false;
    for (let i = 0; i < this.points.length; i++) {
      const element = this.points[i];
      if(this.arraysAreEqual(element, point)){
        isVertex = true;
        break;
      }
    }
    return isVertex;
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

  removeDuplicatePoints() {
    // Convert arrays to JSON strings and use a Set to filter out duplicates
    const uniquePoints = [...new Set(this.points.map(JSON.stringify))].map(JSON.parse);
    this.points = uniquePoints;
  }

}