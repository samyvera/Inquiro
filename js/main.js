window.onload = () => {
    var scale = 4;

    var gameSize = new Vector2D(4, 4);
    var imageSize = new Vector2D(256, 256);

    var game = new Game(scale);

    const worker = new Worker(URL.createObjectURL(
        new Blob(["("+generateOverworld.toString() +
            ")({ x:" + gameSize.x + ", y:"+ gameSize.y + " }, { x:" + imageSize.x + ", y:"+ imageSize.y + " })"], {type: 'text/javascript'})
    ));
    worker.onmessage = message => {
        game.loadProgress = message.data.loadProgress;
        if (message.data.overworld) {
            game.init(message.data.overworld);
            worker.terminate();
        }
    };

    var mouse = new Mouse();
    var display = new Display(scale);

    var frame = () => {
        mouse.update();
        game.update(mouse);
        display.update(game);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}