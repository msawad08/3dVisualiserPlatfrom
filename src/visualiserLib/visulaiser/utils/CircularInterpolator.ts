export class CircularInterpolator {

    private start: number;
    private end: number;
    private max: number;
    difference: number;

    constructor(start: number, end: number, max: number = Math.PI * 2) {
        this.max = max;
        this.start = this.normalize(start);
        this.end = this.normalize(end);
        this.difference = this.getDifference();

    }

    private normalize(value: number) {
        while (value < 0) {
            value += this.max;
        }
        while (value >= this.max) {
            value -= this.max;
        }
        return value;
    }

    private getDifference(){
        let difference = this.end - this.start;
        if (difference > Math.PI) {
          difference -= this.max;
        } else if (difference < -Math.PI) {
          difference += this.max;
        }
        return difference;
    }

    interpolate(t: number){


        // Perform linear interpolation
        const interpolatedAngle = this.start + this.difference * t;
      
        // Normalize the result
        return this.normalize(interpolatedAngle);
    }


}