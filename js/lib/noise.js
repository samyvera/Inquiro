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