export class svgRandomGenerate {

  POLYGON_BOX_SEPERATOR = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];

  /**
   * 
   * @param {string} svgID ID of svg element
   */
  constructor(svgID) {
    this.svgElement = document.getElementById(svgID);
    const bbox = this.svgElement.getBoundingClientRect();
    this.width = bbox.width;
    this.height = bbox.height;
  }

  /**
   * Generate random rectangle svg elements
   * @param {number} count number of random elements
   */
  generateRandomRectangle(count = 1) {
    const inputNumber = Number(count);
    if (isNaN(inputNumber)) {
      alert('The value entered is not a number.');
    } else if (inputNumber <= 0) {
      alert('The value must be greater than 0.');
    } else {
      this.removeGeneratedElements();
      this.generateRectangles(inputNumber);
    }
  }

  removeGeneratedElements() {
    const elements = document.getElementsByClassName('random-generate');
    const elementsArray = Array.from(elements);
    elementsArray.forEach(element => {
      element.remove();
    });
  }

  generateRectangles(inputNumber) {
    for (let i = 0; i < inputNumber; i++) {
      const randomX = this.getRandomNumber(0, this.width);
      const randomY = this.getRandomNumber(0, this.height);
      const randomWidth = this.getRandomNumber(10, this.width - randomX - 10);
      const randomHeight = this.getRandomNumber(10, this.height - randomY - 10);
      const randomColor = this.getRandomColor();

      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectElement.setAttribute('x', randomX);
      rectElement.setAttribute('y', randomY);
      rectElement.setAttribute('width', randomWidth);
      rectElement.setAttribute('height', randomHeight);
      rectElement.setAttribute('fill', randomColor);
      rectElement.setAttribute('class', 'area-calculate random-generate');
      rectElement.setAttribute('areagroup', this.getRandomNumber(1, 3));

      this.svgElement.appendChild(rectElement);
    }
  }

  /**
 * Generate random rectangle svg elements
 * @param {number} count number of random elements
 */
  generateRandomPolygon(count = 1) {
    const inputNumber = Number(count);
    if (isNaN(inputNumber)) {
      alert('The value entered is not a number.');
    } else if (inputNumber <= 0) {
      alert('The value must be greater than 0.');
    } else {
      this.removeGeneratedElements();
      this.generatePolygons(inputNumber);
    }
  }

  generatePolygons(inputNumber) {
    for (let i = 0; i < inputNumber; i++) {
      const randomX = this.getRandomNumber(0, this.width);
      const randomY = this.getRandomNumber(0, this.height);
      const randomWidth = this.getRandomNumber(10, this.width - randomX - 10);
      const randomHeight = this.getRandomNumber(10, this.height - randomY - 10);
      const randomColor = this.getRandomColor();

      const segmentWidth = Math.max(Math.floor(randomWidth / 3 ), 1);
      const segmentHeight = Math.max(Math.floor(randomHeight / 3 ), 1);

      let numberOfPointsInSegment = this.generateRandomNumbers(8, 0, 1);
      while(numberOfPointsInSegment.reduce((partialSum, a) => partialSum + a, 0) < 3) {
        numberOfPointsInSegment = this.generateRandomNumbers(8, 0, 1);
      }

      const points = [];

      for (let i = 0; i < this.POLYGON_BOX_SEPERATOR.length; i++) {
        const segment = this.POLYGON_BOX_SEPERATOR[i];
        if(numberOfPointsInSegment[i] > 0) {
          const x = this.getRandomNumber(randomX + segment[0] * segmentWidth, randomX + (segment[0] + 1) * segmentWidth - 1);
          const y = this.getRandomNumber(randomY + segment[1] * segmentHeight, randomY + (segment[1] + 1) * segmentHeight - 1);
          points.push([x, y]);
        }
      }
      const pointsString = points.map(point => point.join(',')).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pointsString);
      polygon.setAttribute('fill', randomColor);
      polygon.setAttribute('class', 'area-calculate random-generate');
      polygon.setAttribute('areagroup', this.getRandomNumber(1, 3));

      this.svgElement.appendChild(polygon);
    }
  }

  /**
   * Generate random hex colors
   * @returns hex color
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Generate random between min and max number
   * @param {number} min number from
   * @param {number} max number to
   * @returns random number between min and max
   */
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateRandomNumbers(count, min, max) {
    let numbers = [];
    for (let i = 0; i < count; i++) {
        let randomNum = this.getRandomNumber(min, max);
        numbers.push(randomNum);
    }
    return numbers;
  }

  transformArray(arr) {
    if(arr.length > 0){
      if(arr[0] == 0 && arr[arr.length] == 0) {
        arr[0] = 1;
      }
    }
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === 0 && arr[i + 1] === 0) {
            arr[i + 1] = 1; // Change the second zero to one
        }
    }
    return arr;
  }

}