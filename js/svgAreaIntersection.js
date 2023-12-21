export class svgAreaIntersection{

  lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){
    let t = ((y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1)) / ((x4 - x3) * (y2 - y1) - (y4 - y3) * (x2 - x1));
    let s = ((x3 - x1) + t * (x4 - x3)) / (x2 - x1);
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      let intersection1 = (x1 + s * (x2 - x1));
      let intersection2 = (y1 + s * (y2 - y1));
      let intersection3 = (x3 + t * (x4 - x3));
      let intersection4 = (y3 + t * (y4 - y3));
      return {x: intersection1, y: intersection2};
    }
    else {
      return {x: null, y: null};
    }
  }
}