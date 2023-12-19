export class svgRandomGenerate{

  constructor(svgID){
    this.svgElement = document.getElementById(svgID);
    const bbox = this.svgElement.getBoundingClientRect();
    this.width = bbox.width;
    this.height = bbox.height;
  }

  generateRandomRectangle(count = 1){
    for (let i = 0; i < count; i++) {
      const randomX = this.getRandomNumber(0, this.width);
      const randomY = this.getRandomNumber(0, this.height);
      const randomWidth = this.getRandomNumber(0, this.width - randomX);
      const randomHeight = this.getRandomNumber(0, this.height - randomY);
      const randomColor = this.getRandomColor();
    
      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectElement.setAttribute('x', randomX);
      rectElement.setAttribute('y', randomY);
      rectElement.setAttribute('width', randomWidth);
      rectElement.setAttribute('height', randomHeight);
      rectElement.setAttribute('fill', randomColor);
      rectElement.setAttribute('class', 'area-calculate');
      rectElement.setAttribute('areagroup', this.getRandomNumber(1, 3));
    
      this.svgElement.appendChild(rectElement);
    }
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}