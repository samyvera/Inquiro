class Mouse {
    constructor() {
        this.resetMouse = () => {
            this.pos = null;
            this.click = 'up';
            this.hold = 0;
        }
        this.resetMouse();

        this.update = () => {
            if (this.click === 'down') this.hold++;
            else if (this.click === 'release') {
                if (this.clickBuffer) this.clickBuffer = false;
                else {
                    this.click = 'up';
                    this.hold = 0;
                }
            }
        }

        document.body.onmousemove = event => this.pos = new Vector2D(event.offsetX, event.offsetY);
        document.body.onmouseout = event => this.resetMouse();
        document.body.onmousedown = event => this.click = 'down';
        document.body.onmouseup = event => {
            this.click = 'release';
            this.clickBuffer = true;
        }
    }
}