This algorhitm is for calculating area of complex SVG elements. Here is three algorhitm for calculate area.

All algorhitm needs id of svg element. In demo is it `tutorial_svg`. In this svg element the algorhitm take every elements with class `area-calculate`.

```
<rect x="352" y="1649" width="774" height="178" fill="#90929C" class="area-calculate random-generate" areagroup="2"></rect>
```

# 1. Lazy algorhitm

This algorhitm take every point in svg and trying it if, is in fill of svg element. After that, sums all points which are in fill and that is area.

### Using

```
    const areaCalculator = new svgAreaCalculation();
    const area = areaCalculator.lazyStupidAreaCalculation('tutorial_svg');
```

### Pros

- Easy to implement

### Cons

- Non efficiency for memory and time
- Non accurate due to to pixel. The points on the edge do not have to belong to the entire element. In this case the calculated area can be bigger than the original area.

# 2. Lehoczky heuristic algorhitm

For each svg element, this heuristic algorhitm takes number of points from one element and try if the point is in fill in another element. At the end, multiplies the ratio by the total area of the element and adds it into existing area. The calculated area can be smaller than the original area.

### Using

```
    const areaCalculator = new svgAreaCalculation();
    const area = areaCalculator.areaInSvgWithIntersection('tutorial_svg', numberOfRandomPoints);
```

### Number of random points

- LIT_RANDOM_POINTS = 1000 - quick but not precise
- MOD_RANDOM_POINTS = 10000 - best compromise between time comsuption and precise. Recommended for most cases.
- HIGH_RANDOM_POINTS = 100000 - slow and the efficiency is close to zero

### Pros

- Relative accurate for small ammounts of svg elements and with high number of points.
- Relative quick for small amounts of svg elements and with high number of points.

### Cons

- For big ammount of svg element is slow.

# 3. Lehoczky merging polygon algorhitm

This algorhitm merge all svg elements into one or many svg elements. It also merging gaps between polygons. After that calculate area all merged polygons via Shoelace formula and substracts area of gaps.

### Using

```
    const intersectElements = new svgAreaIntersection('tutorial_svg');
    const area = intersectElements.polygonIntersectionInSvg(show, redraw, color, opacity, group);
```

### Pros
- Quick and precise area calculation

### Cons

# Testing

## Lazy algorhitm

- 10 polygons
   - Time = 32 378 ms
   - Area = 1 056 609 px
   - Deviation = -5 218 px
- 50 polygons
   - Time = 270 252 ms
   - Area = 3 730 421 px
   - Deviation = -2 915 px
- 100 polygons
   - Time =
   - Area =
   - Deviation =

## Lehoczky heuristic algorhitm

- 10 polygons
  - 1000 points
     - Time = 55 ms
     - Area = 1 048 854 px
     - Deviation = 2 537 px
  - 10000 points
     - Time = 518.5 ms
     - Area = 1 050 992 px
     - Deviation = 399 px
  - 100000 points
     - Time = 4769 ms
     - Area = 1 051 543 px
     - Deviation = -152 px
- 50 polygons
  - 1000 points
     - Time = 1 664 ms
     - Area = 3 632 566 px
     - Deviation = 94 940 px
  - 10000 points
     - Time = 15 994 ms
     - Area = 3 696 840 px
     - Deviation = 30 666 px
  - 100000 points
     - Time = 16 0527 ms
     - Area = 3 717 148 px
     - Deviation = 10 358 px
- 100 polygons
  - 1000 points
     - Time =
     - Area =
     - Deviation =
  - 10000 points
     - Time =
     - Area =
     - Deviation =
  - 100000 points
     - Time =
     - Area =
     - Deviation =

## Lehoczky merging polygon algorhitm

- 10 polygons
   - Time = 23 ms
   - Area = 1 051 391 px
   - Deviation = 0 px
- 50 polygons
   - Time = 267 ms
   - Area = 3 727 506 px
   - Deviation = 0 px
- 100 polygons
   - Time =
   - Area =
   - Deviation =
