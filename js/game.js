class Game {
    constructor(scale) {
        this.scale = scale;
        this.overworld = null;
        this.mouse = null;
        this.loadProgress = 0;

        this.init = overworldData => {
            var islands = new Array(overworldData.size.x * overworldData.size.y).fill(null);
            overworldData.islands.forEach((island, index) => {
                if (island) {
                    var img = document.createElement('img');
                    img.src = island.terrainImgSrc;

                    islands[index] = new Island(
                        new Vector2D(island.pos.x, island.pos.y),
                        new Vector2D(island.size.x, island.size.y),
                        island.data,
                        island.biomeData,
                        img,
                        island.structures
                    );
                }
            });
            this.overworld = new Overworld(
                new Vector2D(overworldData.size.x, overworldData.size.y),
                new Vector2D(overworldData.islandSize.x, overworldData.islandSize.y),
                islands
            );
            this.offset = new Vector2D(-innerWidth / 2, -innerHeight / 2).plus(this.overworld.size.timesOther(this.overworld.islandSize).times(this.scale / 2));
            this.currentOffset = new Vector2D(-innerWidth / 2, -innerHeight / 2).plus(this.overworld.size.timesOther(this.overworld.islandSize).times(this.scale / 2));
        }

        this.updateOffset = mouse => {
            this.mouse = mouse;
            if (mouse.pos && mouse.click === 'release') {
                this.offset = this.offset.plus(new Vector2D(
                    Math.abs(innerWidth / 2 - mouse.pos.x) * (mouse.pos.x < innerWidth / 2 ? -1 : 1),
                    Math.abs(innerHeight / 2 - mouse.pos.y) * (mouse.pos.y < innerHeight / 2 ? -1 : 1)
                )).round();
                
                this.trueOffset = {
                    ...this.offset
                };
            }

            if (this.overworld.size.x * this.overworld.islandSize.x * this.scale < innerWidth) this.offset.x = -innerWidth / 2 + this.overworld.size.x * this.overworld.islandSize.x * this.scale / 2;
            else if (this.offset.x < 0) this.offset.x = 0;
            else if (this.overworld.size.x * this.overworld.islandSize.x * this.scale - innerWidth < this.offset.x) this.offset.x = this.overworld.size.x * this.overworld.islandSize.x * this.scale - innerWidth;

            if (this.overworld.size.y * this.overworld.islandSize.y * this.scale < innerHeight) this.offset.y = -innerHeight / 2 + this.overworld.size.y * this.overworld.islandSize.y * this.scale / 2;
            else if (this.offset.y < 0) this.offset.y = 0;
            else if (this.overworld.size.y * this.overworld.islandSize.y * this.scale - innerHeight < this.offset.y) this.offset.y = this.overworld.size.y * this.overworld.islandSize.y * this.scale - innerHeight;

            this.currentOffset = this.currentOffset.round().equals(this.offset) ?
                this.currentOffset.round() :
                this.currentOffset.lerp(this.offset, 0.15);
        }

        this.update = mouse => {
            if (this.overworld) {
                this.updateOffset(mouse);
            }
        }
    }
}