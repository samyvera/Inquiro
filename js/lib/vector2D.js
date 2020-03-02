class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.plus = other => new Vector2D(this.x + other.x, this.y + other.y);
        this.times = factor => new Vector2D(this.x * factor, this.y * factor);
        this.timesOther = other => new Vector2D(this.x * other.x, this.y * other.y);
        this.equals = other => this.x === other.x && this.y === other.y;
        this.floor = () => new Vector2D(Math.floor(this.x), Math.floor(this.y));
        this.round = () => new Vector2D(Math.round(this.x), Math.round(this.y));
        this.ceil = () => new Vector2D(Math.ceil(this.x), Math.ceil(this.y));
        this.lerp = (other, amt) => new Vector2D((1 - amt) * this.x + amt * other.x, (1 - amt) * this.y + amt * other.y);
    }
}