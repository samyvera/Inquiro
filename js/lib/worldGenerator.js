var generateOverworld = async (size, islandSize) => {

    // totro
    var getTotroName = (lengMin, lengMax) => {
        var vowels = new Array(
            ['a', 7], ['a', 7], ['a', 7], ['a', 7], ['a', 7], ['a', 7],
            ['e', 7], ['e', 7], ['e', 7], ['e', 7], ['e', 7], ['e', 7],
            ['e', 7], ['e', 7], ['e', 7], ['e', 7], ['e', 7], ['e', 7],
            ['i', 7], ['i', 7], ['i', 7], ['i', 7], ['i', 7], ['i', 7],
            ['o', 7], ['o', 7], ['o', 7],
            ['u', 7], ['u', 7], ['u', 7],
            ['y', 7],
            ['ae', 7], ['ai', 7], ['au', 7], ['ay', 7],
            ['ea', 7], ['ei', 7], ['eo', 7], ['eu', 7],
            ['ia', 7], ['ie', 7], ['io', 7],
            ['oe', 7], ['oi', 7], ['ou', 7],
            ['ua', 7], ['ue', 7],
            ['eau', 7],
            ['oue', 7], ['oui', 7],
        );
        var consonants = new Array(
            ['b', 7],
            ['c', 7], ['c', 7], ['c', 7], ['c', 7],
            ['d', 7], ['d', 7], ['d', 7], ['d', 7],
            ['f', 7], ['f', 7],
            ['g', 7],
            ['h', 7],
            ['j', 7],
            ['k', 7],
            ['l', 7], ['l', 7], ['l', 7], ['l', 7], ['l', 7], ['l', 7],
            ['m', 7], ['m', 7], ['m', 7],
            ['n', 7], ['n', 7], ['n', 7], ['n', 7], ['n', 7], ['n', 7], ['n', 7], ['n', 7],
            ['p', 7], ['p', 7], ['p', 7],
            ['qu', 6], ['qu', 6],
            ['r', 7], ['r', 7], ['r', 7], ['r', 7], ['r', 7], ['r', 7], ['r', 7],
            ['s', 7], ['s', 7], ['s', 7], ['s', 7], ['s', 7], ['s', 7], ['s', 7], ['s', 7], ['s', 7],
            ['t', 7], ['t', 7], ['t', 7], ['t', 7], ['t', 7], ['t', 7], ['t', 7], ['t', 7],
            ['v', 7], ['v', 7],
            ['w', 7],
            ['x', 7],
            ['z', 7],
            ['br', 6],
            ['ch', 7], ['cl', 6], ['cr', 6], ['ct', 6],
            ['dr', 6],
            ['fr', 6],
            ['gr', 6], ['gl', 6], ['gn', 6],
            ['ph', 7], ['pr', 6], ['pl', 6], ['ps', 6],
            ['sb', 7], ['sc', 7], ['sd', 7], ['sh', 7], ['st', 7], ['sr', 6],  ['sl', 6], ['sp', 6],
            ['th', 7], ['tr', 6], ['ts', 6],
            ['str', 6],
        );
        
        var rolldie = (minvalue, maxvalue) => {
            var result;
            while (1) {
                result = Math.floor(Math.random() * (maxvalue - minvalue + 1) + minvalue);
                if ((result >= minvalue) && (result <= maxvalue)) {
                    return result;
                }
            }
        }
    
        var data = '';
        var genname = '';
        var leng = rolldie(lengMin, lengMax);
        var isvowel = rolldie(0, 1);
    
        for (var i = 1; i <= leng; i++) {
            do {
                data = isvowel ?
                    vowels[rolldie(0, vowels.length - 1)] :
                    consonants[rolldie(0, consonants.length - 1)];
                if (i == 1) {
                    if (data[1] & 2) break;
                } else if (i == leng) {
                    if (data[1] & 1) break;
                } else {
                    if (data[1] & 4) break;
                }
            } while (1);
            genname += data[0];
            isvowel = 1 - isvowel;
        }
    
        return (genname.slice(0, 1)).toUpperCase() + genname.slice(1);
    }

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
        var offset = Math.abs(Math.floor(getMinMax(data).min));

        var structures = [];
        for (let y = 0; y < size.y; y++) {
            for (let x = 0; x < size.x; x++) {
                var i = y * size.x + x;
                var value = (data[i] + offset);
                if (Math.random() >= 0.75 && x % 16 === 0 && y % 16 === 0 && value >= 11.75 && value < 12.75) {
                    var name = getTotroName(3, 6);
                    structures.push({
                        x:x,
                        y:y,
                        value:value,
                        name:name
                    });
                }
            }
        }

        //imgsrc
        var canvas = new OffscreenCanvas(size.x, size.y);
        var cx = canvas.getContext("2d");
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
        cx.fillStyle = '#f00';
        structures.forEach(structure => {
            cx.fillRect(
                structure.x - 4,
                structure.y - 4,
                8,
                8
            );
        });

        return canvas[canvas.convertToBlob ? 'convertToBlob' : 'toBlob']().then(blob => {
            return {
                pos: pos,
                size: size,
                data: data,
                biomeData: biomeData,
                terrainImgSrc: new FileReaderSync().readAsDataURL(blob),
                structures: structures
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