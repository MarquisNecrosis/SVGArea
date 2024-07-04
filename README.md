This algorithm is for calculating area of complex SVG elements. Here is three algorithm for calculate area.

All algorithm needs id of svg element. In demo is it `tutorial_svg`. In this svg element the algorithm take every elements with class `area-calculate`.

```
<rect x="352" y="1649" width="774" height="178" fill="#90929C" class="area-calculate random-generate" areagroup="2"></rect>
```

# 1. Lazy algorithm

This algorithm take every point in svg and trying it if, is in fill of svg element. After that, sums all points which are in fill and that is area.

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

# 2. Lehoczky heuristic algorithm

For each svg element, this heuristic algorithm takes number of points from one element and try if the point is in fill in another element. At the end, multiplies the ratio by the total area of the element and adds it into existing area. The calculated area can be smaller than the original area.

### Procedure

![svg heuristic](https://github.com/MarquisNecrosis/SVGArea/assets/49921881/70223d1a-d0a3-4fce-a05f-244890afaa33)

1. First(black) rectangle has area `a1 * b1`
2. The second(red) rectangle has area `a2 * b2`, but intersects the black one
3. Generate random points in red rectangle. In our case is 10.
4. 8 points are not in black one fill and 2 are inside black one so the area will be `(8 / 10) * (a2 * b2)`
5. The area of two intersects rectangle will be `a1 * b1 + 0.8 * a2 * b2` 

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

# 3. Lehoczky merging polygon algorithm

This algorithm merge all svg elements into one or many svg elements. It also merging gaps between polygons. After that calculate area all merged polygons via Shoelace formula and substracts area of gaps.

### Using

```
    const intersectElements = new svgAreaIntersection('tutorial_svg');
    const area = intersectElements.polygonIntersectionInSvg(show, redraw, color, opacity, group);
```

### Pros
- Quick and precise area calculation

### Cons

# Testing

## Lazy algorithm

- 10 polygons
   - Time = 32 378 ms
   - Area = 1 056 609 px
   - Deviation = -5 218 px
- 50 polygons
   - Time = 270 252 ms
   - Area = 3 730 421 px
   - Deviation = -2 915 px
- 100 polygons
   - Time = 456 986 ms
   - Area = 3 711 372 px
   - Deviation = -7 690 px

## Lehoczky heuristic algorithm

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
     - Time = 6 742 ms
     - Area = 3 721 066 px
     - Deviation = -17 384 px
  - 10000 points
     - Time = 67 215 ms
     - Area = 3 710 963 px
     - Deviation = -7 281 px
  - 100000 points
     - Time = 663 222 ms
     - Area = 3 696 769 px
     - Deviation = 6 913 px

## Lehoczky merging polygon algorithm

- 10 polygons
   - Time = 23 ms
   - Area = 1 051 391 px
   - Deviation = 0 px
- 50 polygons
   - Time = 267 ms
   - Area = 3 727 506 px
   - Deviation = 0 px
- 100 polygons
   - Time = 369 ms
   - Area = 3 703 682 px
   - Deviation = 0 px
