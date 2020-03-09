class Display {
    constructor(scale) {
        this.frame = 0;
        this.scale = scale;

        this.canvas = document.createElement('canvas');
        this.cx = this.canvas.getContext("2d");

        this.loadImg = document.createElement("img");
        this.loadImg.src = 'img/load.png';
        this.load2Img = document.createElement("img");
        this.load2Img.src = 'img/load2.png';
        this.load3Img = document.createElement("img");
        this.load3Img.src = 'img/load3.png';

        this.update = game => {
            this.cx.clearRect(0, 0, innerWidth, innerHeight);

            if (game.overworld) {
                this.cx.translate(-game.currentOffset.x, -game.currentOffset.y);
                this.drawBackground(game);
                this.cx.translate(game.currentOffset.x, game.currentOffset.y);

                this.drawScanlines(game);

                this.cx.translate(-game.currentOffset.x, -game.currentOffset.y);
                this.drawBackground2(game);
                this.cx.translate(game.currentOffset.x, game.currentOffset.y);

                this.drawMap(game);
            } else {
                this.cx.fillStyle = '#000';
                this.cx.fillRect(0, Math.floor(innerHeight * 0.75) - 2, innerWidth, 4);

                this.cx.fillStyle = '#fff';
                this.cx.fillRect(0, Math.floor(innerHeight * 0.75) - 2, Math.floor(game.loadProgress * innerWidth / 100), 4);

                this.cx.drawImage(this.load2Img,
                    0, 0, 21, 21,
                    innerWidth - 84,
                    innerHeight * 0.75 - 2 - 84,
                    84, 84
                );

                this.cx.drawImage(this.load3Img,
                    0, 0, 384, 192,
                    innerWidth - 384,
                    innerHeight * 0.75 - 2 - 192,
                    384, 192
                );

                this.cx.drawImage(this.loadImg,
                    0, 0, 384, 192,
                    innerWidth - 384,
                    innerHeight * 0.75 - 2 - 192 - 16 + Math.sin(this.frame * 0.05) * 4,
                    384, 192
                );
            }

            this.frame++;
        }

        this.drawScanlines = game => {
            //scanlines
            this.cx.globalAlpha = 0.25;
            this.cx.lineWidth = 2;
            for (let i = 0; i < this.canvas.height / 4; i++) {
                this.cx.strokeStyle = '#000';
                this.cx.beginPath();
                this.cx.moveTo(0, i * 4);
                this.cx.lineTo(this.canvas.width, i * 4);
                this.cx.stroke();
                this.cx.closePath();

                var xSize = Math.floor(Math.random() * 16) + 16;
                if (!Math.floor(Math.random() * 16)) {
                    var xPos = Math.floor(Math.random() * this.canvas.width);
                    this.cx.strokeStyle = '#fff';
                    this.cx.beginPath();
                    this.cx.moveTo(xPos, i * 4);
                    this.cx.lineTo(xPos + xSize, i * 4);
                    this.cx.stroke();
                    this.cx.closePath();
                }
            }

            this.cx.globalCompositeOperation = 'color-dodge';
            var gradient = this.cx.createLinearGradient(-(this.canvas.width / 2) + (this.frame * 16) % (this.canvas.width * 2), 0, (this.frame * 16) % (this.canvas.width * 2), 0);
            gradient.addColorStop(0, '#fff0');
            gradient.addColorStop(0.5, '#ffff');
            gradient.addColorStop(1, '#fff0');
            this.cx.strokeStyle = gradient;
            for (let i = 0; i < this.canvas.height; i++) {
                if ((16 + i + (Math.floor(game.currentOffset.y) % 32)) % 32 === 0) {
                    this.cx.beginPath();
                    this.cx.moveTo(0, i);
                    this.cx.lineTo(this.canvas.width, i);
                    this.cx.stroke();
                    this.cx.closePath();
                }
            }
            for (let i = 0; i < this.canvas.width; i++) {
                if ((16 + i  + (Math.floor(game.currentOffset.x) % 32)) % 32 === 0) {
                    this.cx.beginPath();
                    this.cx.moveTo(i, 0);
                    this.cx.lineTo(i, this.canvas.height);
                    this.cx.stroke();
                    this.cx.closePath();
                }
            }
            this.cx.globalCompositeOperation = 'normal';

            this.cx.globalAlpha = 1;
        }

        this.drawMap = game => {

            var zoom = 0.125;

            this.cx.fillStyle = '#024';
            this.cx.fillRect(
                0, 0,
                game.overworld.size.x * game.overworld.islandSize.x * zoom,
                game.overworld.size.y * game.overworld.islandSize.y * zoom
            );

            game.overworld.islands.forEach(island => {
                if (island) {
                    this.cx.drawImage(island.terrainImg,
                        0, 0,
                        island.size.x, island.size.y,
                        island.pos.x * island.size.x * zoom,
                        island.pos.y * island.size.x * zoom,
                        island.size.x * zoom,
                        island.size.x * zoom
                    );
                }
            });

            this.cx.lineWidth = 2;
            this.cx.strokeStyle = '#fff';
            this.cx.strokeRect(
                0, 0,
                game.overworld.size.x * game.overworld.islandSize.x * zoom,
                game.overworld.size.y * game.overworld.islandSize.y * zoom
            );

            this.cx.strokeRect(
                game.currentOffset.x * zoom / this.scale,
                game.currentOffset.y * zoom / this.scale,
                innerWidth * zoom / this.scale,
                innerHeight * zoom / this.scale
            );
        }

        this.round16 = x => Math.ceil(x / 16) * 16;

        this.drawBackground = game => {
            this.cx.fillStyle = '#024';
            this.cx.fillRect(
                game.currentOffset.x, game.currentOffset.y,
                innerWidth, innerHeight
            );

            game.overworld.islands.forEach(island => {
                if (
                    island &&
                    island.pos.x * island.size.x * this.scale + island.size.x * this.scale - game.currentOffset.x > 0 &&
                    island.pos.y * island.size.y * this.scale + island.size.y * this.scale - game.currentOffset.y > 0 &&
                    island.pos.x * island.size.x * this.scale - game.currentOffset.x < innerWidth &&
                    island.pos.y * island.size.y * this.scale - game.currentOffset.y < innerHeight
                ) {
                    this.cx.drawImage(island.terrainImg,
                        0, 0,
                        island.size.x, island.size.y,
                        island.pos.x * island.size.x * this.scale,
                        island.pos.y * island.size.y * this.scale,
                        island.size.x * this.scale,
                        island.size.y * this.scale
                    );
                }
            });
        }

        this.drawBackground2 = game => {

            this.cx.shadowBlur = 8;
            this.cx.shadowColor = '#000';

            this.cx.strokeStyle = '#fff';
            this.cx.lineWidth = 4;
            this.cx.setLineDash([16, 4]);
            this.cx.lineDashOffset = -Math.floor((this.frame / 4) % 20);

            var hoveredIsland = null;
            var hoveredStructure = null;

            game.overworld.islands.forEach(island => {
                if (island) {
                    var isHovered = game.mouse.pos &&
                        island.pos.equals(new Vector2D(
                            Math.floor((game.currentOffset.x + game.mouse.pos.x) / 4 / game.overworld.islandSize.x),
                            Math.floor((game.currentOffset.y + game.mouse.pos.y) / 4 / game.overworld.islandSize.y)));
                    hoveredIsland = isHovered ? island : hoveredIsland;

                    island.structures.forEach(structure => {
                        var isHovered = game.mouse.pos &&
                            structure.x === this.round16(Math.floor((game.currentOffset.x + game.mouse.pos.x) / 4 - island.pos.x * game.overworld.islandSize.x) - 8) &&
                            structure.y === this.round16(Math.floor((game.currentOffset.y + game.mouse.pos.y) / 4 - island.pos.y * game.overworld.islandSize.y) - 8);
                        hoveredStructure = isHovered ? structure : hoveredStructure;

                        var squareSize = isHovered ? 32 : 16;

                        this.cx.fillStyle = '#fff';
                        this.cx.fillRect(
                            (island.pos.x * island.size.x + structure.x) * this.scale - 8,
                            (island.pos.y * island.size.y + structure.y) * this.scale - 8,
                            16,
                            16
                        );

                        this.cx.strokeRect(
                            (island.pos.x * island.size.x + structure.x) * this.scale - squareSize,
                            (island.pos.y * island.size.y + structure.y) * this.scale - squareSize,
                            squareSize * 2,
                            squareSize * 2
                        );
                    });
                }
            });

            if (hoveredIsland && hoveredStructure) {
                this.cx.fillStyle = '#0008';
                this.cx.fillRect(
                    8 + (hoveredIsland.pos.x * hoveredIsland.size.x + hoveredStructure.x) * this.scale + 32,
                    (hoveredIsland.pos.y * hoveredIsland.size.y + hoveredStructure.y) * this.scale - 40,
                    256,
                    128
                );
                this.cx.fillStyle = '#fff';
                this.cx.font = 32 + 'px consolas';
                this.cx.textAlign = 'center';
                this.cx.fillText(
                    hoveredStructure.name,
                    (hoveredIsland.pos.x * hoveredIsland.size.x + hoveredStructure.x) * this.scale + 32 + 128,
                    (hoveredIsland.pos.y * hoveredIsland.size.y + hoveredStructure.y) * this.scale + 2
                );
                this.cx.textAlign = 'left';
                this.cx.fillText(
                    "X:" + (hoveredIsland.pos.x * hoveredIsland.size.x + hoveredStructure.x),
                    16 + (hoveredIsland.pos.x * hoveredIsland.size.x + hoveredStructure.x) * this.scale + 32,
                    (hoveredIsland.pos.y * hoveredIsland.size.y + hoveredStructure.y) * this.scale + 40 + 2
                );
                this.cx.fillText(
                    "Y:" + (hoveredIsland.pos.y * hoveredIsland.size.y + hoveredStructure.y),
                    16 + (hoveredIsland.pos.x * hoveredIsland.size.x + hoveredStructure.x) * this.scale + 32,
                    (hoveredIsland.pos.y * hoveredIsland.size.y + hoveredStructure.y) * this.scale + 64 + 2
                );
            }

            this.cx.strokeRect(
                game.currentOffset.x + 8,
                game.currentOffset.y + 8,
                innerWidth - 16,
                innerHeight - 16
            );

            this.cx.setLineDash([]);
            this.cx.shadowBlur = 0;
        }

        this.resize = () => {
            this.canvas.width = innerWidth;
            this.canvas.height = innerHeight;
            this.cx.imageSmoothingEnabled = false;
        }
        this.resize();

        window.addEventListener('resize', this.resize);
        document.body.appendChild(this.canvas);
    }
}