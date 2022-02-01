class Snake {
  sticks;

  constructor(stickCount, headPos, angle, segmentLength) {
    this.sticks = [];

    // Create sticks
    for(let i = 0; i < stickCount; i++) {
      const invIndex = stickCount - i - 1;
      const x = cos(angle) * segmentLength * invIndex;
      const y = sin(angle) * segmentLength * invIndex;
      const stick = new Stick(headPos.x + x, headPos.y + y, angle, segmentLength, i);

      this.sticks.push(stick);
    }

    // Link sticks
    for(let stick of this.sticks) {
      stick.setPrev(this.sticks[stick.index - 1]);
      stick.setNext(this.sticks[stick.index + 1]);
    }

    // Lock last stick
    // this.sticks[stickCount - 1].locked = true;
  }

  follow(x, y) {
    for(let stick of this.sticks) {
      if (stick.index === 0) {
        stick.moveStartTo(x, y);
      } else {
        stick.follow();
      }
    }

    for(let stick of [...this.sticks].reverse()) {
      stick.rubberband();
    }
  }

  append() {
    const length = this.sticks.length;
    const lastSegment = this.sticks[length - 1];
    const stick = new Stick(lastSegment.end.x, lastSegment.end.y, lastSegment.angle, lastSegment.length, length);
    this.sticks.push(stick);
    lastSegment.next = stick;
    stick.prev = lastSegment;
  }

  draw() {
    for(let stick of this.sticks) {

      stick.draw(10);
    }
  }
}
