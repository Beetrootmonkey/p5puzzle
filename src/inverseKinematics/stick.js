const gravity = 5;

class Stick {
  start;
  end;
  angle;
  length;
  prev;
  next;
  index;
  locked;

  constructor(startX, startY, angle, length, index) {
    this.start = createVector(startX, startY);
    this.previousStartPosition = this.start.copy();
    this.angle = angle;
    this.length = length;
    this.index = index;
    this.autoUpdateEnd();
  }

  moveStartTo(x, y) {
    this.updateStart(x, y);
    this.updateAngle();
    this.autoUpdateEnd();
    this.autoUpdateStart();
  }

  moveEndTo(x, y) {
    this.updateEnd(x, y);
    this.updateAngle();
    this.autoUpdateStart();
  }

  follow() {
    if (this.prev) {
      this.moveStartTo(this.prev.end.x, this.prev.end.y);
    }
  }

  rubberband() {
    if (this.next) {
      this.moveEndTo(this.next.start.x, this.next.start.y);
    }
  }

  updateStart(x, y) {
    this.start.set(x, y);
  }

  updateEnd(x, y) {
    this.end.set(x, y);
  }

  updateAngle() {
    this.angle = atan2(this.end.y - this.start.y, this.end.x - this.start.x);
  }

  autoUpdateEnd() {
    if (!this.locked) {
      this.end = this.start.copy().add(createVector(cos(this.angle), sin(this.angle)).mult(this.length));
    }
  }

  autoUpdateStart() {
    this.start = this.end.copy().add(createVector(cos(this.angle), sin(this.angle)).mult(-this.length));
  }

  setPrev(stick) {
    if (stick) {
      this.prev = stick;
    }
  }

  setNext(stick) {
    if (stick) {
      this.next = stick;
    }
  }

  draw(thickness) {
    strokeWeight(thickness);
    stroke('black');
    line(this.start.x, this.start.y, this.end.x, this.end.y);

    // strokeWeight(4);
    // ellipseMode(RADIUS);
    // noFill();
    // circle(this.start.x, this.start.y, 4);
    //
    // strokeWeight(4);
    // noFill();
    // circle(this.end.x, this.end.y, 10);
  }
}
