var generateOverworld = async (size, islandSize) => {

    // noise

    var permutation = new Uint8ClampedArray(256);
    var permutationShuffle = () => {
        for (let i = 0; i < 256; i++) permutation[i] = Math.floor(Math.random() * Math.floor(254)) + 1;
    }

    var perlinNoise = (x, y) => {
        var fade = t => t * t * t * (t * (t * 6 - 15) + 10);
        var lerp = (t, a, b) => a + t * (b - a);
        var scale = n => (1 + n) / 2;
        var grad = (hash, x, y, z) => {
            var h = hash & 15;
            var u = h < 8 ? x : y;
            var v = h < 4 ? y : h == 12 || h == 14 ? x : z;
            return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
        }

        var X = Math.floor(x) & 255;
        var Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        var u = fade(x);
        var v = fade(y);

        var p = new Uint8ClampedArray(512);
        for (var i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

        var A = p[X] + Y;
        var AA = p[A];
        var AB = p[A + 1];
        var B = p[X + 1] + Y;
        var BA = p[B];
        var BB = p[B + 1];

        return scale(
            lerp(v,
                lerp(u,
                    grad(p[AA], x, y, 0),
                    grad(p[BA], x - 1, y, 0)),
                lerp(u,
                    grad(p[AB], x, y - 1, 0),
                    grad(p[BB], x - 1, y - 1, 0)
                )
            )
        );
    }

    var noise = (size, scale, octaves, persistance, lacunarity) => {
        var inverseLerp = (a, b, x) => (x - a) / (b - a);

        if (scale <= 0) scale = 0.0001;

        var maxNoiseHeight = -Infinity;
        var minNoiseHeight = Infinity;

        var halfWidth = size.x / 2;
        var halfHeight = size.y / 2;

        var noiseMap = new Array(size.x * size.y);

        permutationShuffle();

        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {

                var amplitude = 1;
                var frequency = 1;
                var noiseHeight = 0;

                for (let i = 0; i < octaves; i++) {
                    var sampleX = (x - halfWidth) / scale * frequency;
                    var sampleY = (y - halfHeight) / scale * frequency;

                    var perlinValue = perlinNoise(sampleX, sampleY) * 2 - 1;
                    noiseHeight += perlinValue * amplitude;

                    amplitude *= persistance;
                    frequency *= lacunarity;
                }

                if (noiseHeight > maxNoiseHeight) maxNoiseHeight = noiseHeight;
                else if (noiseHeight < minNoiseHeight) minNoiseHeight = noiseHeight;

                noiseMap[y * size.x + x] = noiseHeight;
            }
        }

        noiseMap.map(value => inverseLerp(minNoiseHeight, maxNoiseHeight, value));

        return noiseMap;
    }

    // island

    var generateIsland = async (pos, size) => {

        //data
        var applyBorder = value => {
            var a = 1;
            var b = 2.2;
            return Math.pow(value, a) / (Math.pow(value, a) + Math.pow(b - b * value, a));
        }

        var data = new Array(size.x * size.y).fill(0);

        var layer1 = noise(size, 128, 3, 2, 1);
        for (let i = 0; i < data.length; i++) data[i] += layer1[i];
        var layer3 = noise(size, 32, 2, 2, 1);
        for (let i = 0; i < data.length; i++) data[i] += layer3[i] / 2;
        var layer2 = noise(size, 16, 2, 2, 1);
        for (let i = 0; i < data.length; i++) data[i] += layer2[i] / 3;

        var border = new Array(size.x * size.y).fill(0);
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                border[y * size.x + x] = applyBorder(Math.max(
                    Math.abs(x / size.x * 2 - 1),
                    Math.abs(y / size.y * 2 - 1)
                ));
            }
        }
        for (let i = 0; i < data.length; i++) data[i] -= border[i] * 8;

        // biome
        var biome = 'plain';
        var volcano = Math.random() >= 0.75;
        if (volcano && Math.random() >= 0.75) biome = 'desert';
        else if (!volcano && Math.random() >= 0.75) biome = 'forest';
        var biomeData = {
            biome: biome,
            volcano: volcano,
        }

        var getMinMax = arr => {
            return arr.reduce(({min, max}, v) => ({
                min: min < v ? min : v,
                max: max > v ? max : v,
            }), { min: arr[0], max: arr[0] });
        }

        //imgsrc
        var canvas = new OffscreenCanvas(size.x, size.y);
        var cx = canvas.getContext("2d");
        var offset = Math.abs(Math.floor(getMinMax(data).min));
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {

                var i = y * size.x + x;
                var value = (data[i] + offset);

                cx.fillStyle = (
                    value < 10 ? '#024' : // sea
                    value < 10.75 ? '#135' :
                    value < 11.25 ? '#258' :
                    value < 11.5 ? '#27B' :
                    value < 11.75 ? '#FD8' : // sand
                    value < 12.75 ? biomeData.biome !== 'desert' ? '#481' : '#FD8' : // plain
                    value < 13.25 ? biomeData.biome !== 'desert' ? '#262' : '#EB6' : //forest
                    value < 13.75 ? biomeData.biome === 'desert' ? '#EB6' : biomeData.biome === 'forest' ? '#262' : '#432' :
                    value < 14.25 ? biomeData.biome === 'forest' ? '#262' : '#666' :
                    value < 14.75 ? biomeData.biome === 'forest' ? '#262' : '#777' :
                    biomeData.biome === 'forest' ? '#262' : biomeData.volcano ? '#f92' : '#fff' // snow
                );
                cx.fillRect(x, y, 1, 1);
            }
        }

        return canvas[canvas.convertToBlob ? 'convertToBlob' : 'toBlob']().then(blob => {
            return {
                pos: pos,
                size: size,
                data: data,
                biomeData: biomeData,
                terrainImgSrc: new FileReaderSync().readAsDataURL(blob)
            }
        });
    }

    var islands = new Array(size.x * size.y).fill(null);
    for (let y = 0; y < size.y; y++) {
        for (let x = 0; x < size.x; x++) {
            var index = y * size.x + x;
            if (Math.random() >= 0.75) islands[index] = await generateIsland({
                x: x,
                y: y
            }, islandSize);
            postMessage({
                loadProgress: Math.floor(index * 100 / islands.length),
                overworld: null
            });
        }
    }

    postMessage({
        loadProgress: 100,
        overworld: {
            size: size,
            islandSize: islandSize,
            islands: islands
        }
    });
}