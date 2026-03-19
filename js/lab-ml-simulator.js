document.addEventListener('DOMContentLoaded', function () {
    initMLManifoldSimulator();
});

function initMLManifoldSimulator() {
    var root = document.getElementById('ml-manifold-simulator');
    if (!root) {
        return;
    }

    var embeddingCanvas = document.getElementById('ml-embedding-canvas');
    var densityCanvas = document.getElementById('ml-density-canvas');
    if (!embeddingCanvas || !densityCanvas || !embeddingCanvas.getContext || !densityCanvas.getContext) {
        return;
    }

    var embeddingContext = embeddingCanvas.getContext('2d');
    var densityContext = densityCanvas.getContext('2d');
    var scenario = document.getElementById('ml-sim-scenario');
    var embeddingPill = document.getElementById('ml-embedding-pill');
    var densityPill = document.getElementById('ml-density-pill');
    var notePanel = document.getElementById('ml-note-panel');
    var presetButtons = Array.prototype.slice.call(root.querySelectorAll('[data-ml-preset]'));
    var palette = ['#34d399', '#38bdf8', '#f59e0b', '#f97316', '#a78bfa', '#f472b6', '#facc15', '#2dd4bf'];

    var controls = {
        dims: document.getElementById('ml-dims'),
        clusters: document.getElementById('ml-clusters'),
        overlap: document.getElementById('ml-overlap'),
        neighbors: document.getElementById('ml-neighbors'),
        minCluster: document.getElementById('ml-min-cluster'),
        curl: document.getElementById('ml-curl')
    };

    var outputs = {
        dims: document.getElementById('ml-dims-value'),
        clusters: document.getElementById('ml-clusters-value'),
        overlap: document.getElementById('ml-overlap-value'),
        neighbors: document.getElementById('ml-neighbors-value'),
        minCluster: document.getElementById('ml-min-cluster-value'),
        curl: document.getElementById('ml-curl-value')
    };

    var stats = {
        groups: document.getElementById('ml-groups-stat'),
        noise: document.getElementById('ml-noise-stat'),
        separation: document.getElementById('ml-separation-stat'),
        trust: document.getElementById('ml-trust-stat')
    };

    var PRESETS = {
        customer: {
            dims: 18,
            clusters: 4,
            overlap: 0.55,
            neighbors: 12,
            minCluster: 10,
            curl: 0.85,
            blurb: 'A customer journey graph where intent segments are partly real, partly smeared by channel overlap, seasonality, and messy behavior signals.'
        },
        fraud: {
            dims: 24,
            clusters: 5,
            overlap: 0.82,
            neighbors: 9,
            minCluster: 12,
            curl: 1.2,
            blurb: 'Fraud investigations often produce warped manifolds: dense rings of coordinated behavior, border cases around them, and a long tail of ambiguous noise.'
        },
        patient: {
            dims: 16,
            clusters: 6,
            overlap: 0.64,
            neighbors: 15,
            minCluster: 14,
            curl: 0.58,
            blurb: 'Patient phenotype embeddings rarely separate into cartoonishly clean blobs. Local neighborhoods may be stable even when diagnosis-style boundaries stay soft.'
        }
    };

    var state = {
        currentPreset: 'customer',
        resizeTimer: null,
        result: null
    };

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function formatPercent(value, digits) {
        return value.toFixed(digits) + '%';
    }

    function formatMultiplier(value, digits) {
        return value.toFixed(digits) + 'x';
    }

    function setCanvasSize(canvas, context, aspectRatio, minHeight) {
        var parent = canvas.parentElement;
        var styles = window.getComputedStyle(parent);
        var width = Math.max(320, parent.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0));
        var height = Math.max(minHeight, Math.round(width * aspectRatio));
        var ratio = window.devicePixelRatio || 1;

        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function setPresetState(activeKey) {
        presetButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-ml-preset') === activeKey);
        });
    }

    function updateOutputs() {
        outputs.dims.textContent = parseInt(controls.dims.value, 10);
        outputs.clusters.textContent = parseInt(controls.clusters.value, 10);
        outputs.overlap.textContent = formatMultiplier(parseFloat(controls.overlap.value), 2);
        outputs.neighbors.textContent = parseInt(controls.neighbors.value, 10);
        outputs.minCluster.textContent = parseInt(controls.minCluster.value, 10);
        outputs.curl.textContent = parseFloat(controls.curl.value).toFixed(2);
    }

    function applyPreset(name) {
        var preset = PRESETS[name];
        if (!preset) {
            return;
        }

        state.currentPreset = name;
        controls.dims.value = preset.dims;
        controls.clusters.value = preset.clusters;
        controls.overlap.value = preset.overlap;
        controls.neighbors.value = preset.neighbors;
        controls.minCluster.value = preset.minCluster;
        controls.curl.value = preset.curl;
        scenario.textContent = preset.blurb;
        setPresetState(name);
        updateOutputs();
        render();
    }

    function markCustomPreset() {
        if (state.currentPreset === 'custom') {
            return;
        }

        state.currentPreset = 'custom';
        setPresetState('__none__');
        scenario.textContent = 'Custom manifold: tune the geometry until the map feels like your actual feature space, then see whether the density story still survives contact with noise.';
    }

    function createSeed(settings) {
        return (
            settings.dims * 1009 +
            settings.clusters * 313 +
            Math.round(settings.overlap * 100) * 41 +
            settings.neighbors * 61 +
            settings.minCluster * 73 +
            Math.round(settings.curl * 100) * 29 +
            17
        ) >>> 0;
    }

    function mulberry32(seed) {
        return function () {
            var next = seed += 0x6d2b79f5;
            next = Math.imul(next ^ next >>> 15, next | 1);
            next ^= next + Math.imul(next ^ next >>> 7, next | 61);
            return ((next ^ next >>> 14) >>> 0) / 4294967296;
        };
    }

    function randomNormal(rng) {
        var u = 0;
        var v = 0;

        while (u === 0) {
            u = rng();
        }

        while (v === 0) {
            v = rng();
        }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function createUnitVector(length, rng) {
        var vector = new Array(length);
        var sum = 0;
        var index;

        for (index = 0; index < length; index += 1) {
            vector[index] = randomNormal(rng);
            sum += vector[index] * vector[index];
        }

        sum = Math.sqrt(Math.max(sum, 0.000001));
        for (index = 0; index < length; index += 1) {
            vector[index] /= sum;
        }

        return vector;
    }

    function average(values) {
        var sum = 0;
        var index;

        if (!values.length) {
            return 0;
        }

        for (index = 0; index < values.length; index += 1) {
            sum += values[index];
        }

        return sum / values.length;
    }

    function percentile(values, ratio) {
        var safeRatio = clamp(ratio, 0, 1);
        var ordered = values.slice().sort(function (a, b) {
            return a - b;
        });
        var position = (ordered.length - 1) * safeRatio;
        var lower = Math.floor(position);
        var upper = Math.ceil(position);
        var mix = position - lower;

        if (!ordered.length) {
            return 0;
        }

        if (lower === upper) {
            return ordered[lower];
        }

        return ordered[lower] + (ordered[upper] - ordered[lower]) * mix;
    }

    function getSettings() {
        return {
            dims: parseInt(controls.dims.value, 10),
            clusters: parseInt(controls.clusters.value, 10),
            overlap: parseFloat(controls.overlap.value),
            neighbors: parseInt(controls.neighbors.value, 10),
            minCluster: parseInt(controls.minCluster.value, 10),
            curl: parseFloat(controls.curl.value)
        };
    }

    function generateDataset(settings) {
        var rng = mulberry32(createSeed(settings));
        var points = [];
        var clusterIndex;
        var pointIndex;
        var dimensionIndex;

        for (clusterIndex = 0; clusterIndex < settings.clusters; clusterIndex += 1) {
            var angle = (Math.PI * 2 * clusterIndex / settings.clusters) + (rng() - 0.5) * 0.4;
            var center = new Array(settings.dims);
            var basisA = createUnitVector(settings.dims, rng);
            var basisB = createUnitVector(settings.dims, rng);
            var basisC = createUnitVector(settings.dims, rng);
            var basisD = createUnitVector(settings.dims, rng);
            var phase = rng() * Math.PI * 2;
            var scaleA = 0.95 + rng() * 0.8 + settings.overlap * 0.08;
            var scaleB = 0.8 + rng() * 0.65;
            var count = settings.minCluster + 8 + Math.floor(rng() * 10);

            center[0] = Math.cos(angle) * (4.3 + settings.overlap * 0.7);
            if (settings.dims > 1) {
                center[1] = Math.sin(angle) * (4.0 + settings.overlap * 0.7);
            }

            for (dimensionIndex = 2; dimensionIndex < settings.dims; dimensionIndex += 1) {
                center[dimensionIndex] = randomNormal(rng) * (1.6 + dimensionIndex / settings.dims * 0.6) + Math.sin(angle * (dimensionIndex + 1)) * 0.8;
            }

            for (pointIndex = 0; pointIndex < count; pointIndex += 1) {
                var theta = rng() * Math.PI * 2;
                var radial = Math.abs(randomNormal(rng)) * (0.72 + settings.overlap * 0.28);
                var u = Math.cos(theta) * radial + randomNormal(rng) * 0.18;
                var v = Math.sin(theta) * radial * 0.88 + randomNormal(rng) * 0.18;
                var bend = settings.curl * (
                    Math.sin(v * (1.7 + clusterIndex * 0.12) + phase) * 0.62 +
                    Math.cos(u * (1.35 + clusterIndex * 0.1) - phase * 0.6) * 0.36
                );
                var twist = settings.curl * Math.cos((u - v) * (1.2 + clusterIndex * 0.08) + phase) * 0.34;
                var vector = new Array(settings.dims);

                for (dimensionIndex = 0; dimensionIndex < settings.dims; dimensionIndex += 1) {
                    var harmonic = Math.sin(u * (1.25 + dimensionIndex * 0.02) + phase) + Math.cos(v * (1.55 + dimensionIndex * 0.015) - phase * 0.8);
                    vector[dimensionIndex] =
                        center[dimensionIndex] +
                        basisA[dimensionIndex] * (u * scaleA) +
                        basisB[dimensionIndex] * (v * scaleB) +
                        basisC[dimensionIndex] * bend +
                        basisD[dimensionIndex] * twist +
                        harmonic * settings.curl * 0.12 +
                        randomNormal(rng) * settings.overlap * (0.28 + (dimensionIndex / settings.dims) * 0.12);
                }

                points.push({
                    vector: vector,
                    trueCluster: clusterIndex,
                    cluster: -1,
                    color: palette[clusterIndex % palette.length]
                });
            }
        }

        var noiseCount = Math.max(6, Math.round(points.length * (0.04 + settings.overlap * 0.06)));
        for (pointIndex = 0; pointIndex < noiseCount; pointIndex += 1) {
            var noiseVector = new Array(settings.dims);
            var anchor = Math.floor(rng() * settings.clusters) + 1;

            for (dimensionIndex = 0; dimensionIndex < settings.dims; dimensionIndex += 1) {
                noiseVector[dimensionIndex] = randomNormal(rng) * (3.1 + settings.overlap * 1.15) + Math.sin(anchor * (dimensionIndex + 1)) * 0.6;
            }

            points.push({
                vector: noiseVector,
                trueCluster: -1,
                cluster: -1,
                color: '#94a3b8'
            });
        }

        var distances = new Array(points.length);
        var outerIndex;
        var innerIndex;

        for (outerIndex = 0; outerIndex < points.length; outerIndex += 1) {
            distances[outerIndex] = new Array(points.length);
            distances[outerIndex][outerIndex] = 0;
        }

        for (outerIndex = 0; outerIndex < points.length; outerIndex += 1) {
            for (innerIndex = outerIndex + 1; innerIndex < points.length; innerIndex += 1) {
                var total = 0;
                for (dimensionIndex = 0; dimensionIndex < settings.dims; dimensionIndex += 1) {
                    var delta = points[outerIndex].vector[dimensionIndex] - points[innerIndex].vector[dimensionIndex];
                    total += delta * delta;
                }
                total = Math.sqrt(total);
                distances[outerIndex][innerIndex] = total;
                distances[innerIndex][outerIndex] = total;
            }
        }

        return {
            points: points,
            distances: distances
        };
    }

    function annotateNeighborhood(points, distances, settings) {
        var neighborCount = Math.max(4, Math.min(settings.neighbors, points.length - 1));
        var densityRank = Math.max(4, Math.min(points.length - 1, Math.min(settings.minCluster - 1, settings.neighbors)));
        var pointIndex;
        var candidateIndex;

        for (pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
            var neighbors = [];
            for (candidateIndex = 0; candidateIndex < points.length; candidateIndex += 1) {
                if (pointIndex === candidateIndex) {
                    continue;
                }
                neighbors.push({
                    index: candidateIndex,
                    dist: distances[pointIndex][candidateIndex]
                });
            }

            neighbors.sort(function (a, b) {
                return a.dist - b.dist;
            });

            points[pointIndex].neighbors = neighbors;
            points[pointIndex].localScale = average(neighbors.slice(0, neighborCount).map(function (entry) {
                return entry.dist;
            }));
            points[pointIndex].coreDistance = neighbors[Math.min(densityRank - 1, neighbors.length - 1)].dist;
            points[pointIndex].density = 1 / Math.max(points[pointIndex].localScale, 0.0001);
        }
    }

    function buildEmbedding(points, distances, settings) {
        var pointCount = points.length;
        var anchorA = 0;
        var anchorB = 0;
        var anchorC = 0;
        var index;
        var innerIndex;
        var bestScore = -Infinity;

        for (index = 0; index < pointCount; index += 1) {
            if (distances[anchorA][index] > distances[anchorA][anchorB]) {
                anchorB = index;
            }
        }

        for (index = 0; index < pointCount; index += 1) {
            var score = Math.min(distances[index][anchorA], distances[index][anchorB]);
            if (score > bestScore) {
                bestScore = score;
                anchorC = index;
            }
        }

        var dAB = Math.max(0.0001, distances[anchorA][anchorB]);
        var dAC = distances[anchorA][anchorC];
        var dBC = distances[anchorB][anchorC];
        var xC = (dAC * dAC + dAB * dAB - dBC * dBC) / (2 * dAB);
        var yC = Math.sqrt(Math.max(dAC * dAC - xC * xC, 0.0001));
        var positions = new Array(pointCount);

        for (index = 0; index < pointCount; index += 1) {
            var dA = distances[index][anchorA];
            var dB = distances[index][anchorB];
            var dToC = distances[index][anchorC];
            var x = (dA * dA + dAB * dAB - dB * dB) / (2 * dAB);
            var yBase = Math.sqrt(Math.max(dA * dA - x * x, 0));
            var positiveError = Math.abs(Math.hypot(x - xC, yBase - yC) - dToC);
            var negativeError = Math.abs(Math.hypot(x - xC, -yBase - yC) - dToC);

            positions[index] = {
                x: x,
                y: positiveError <= negativeError ? yBase : -yBase
            };
        }

        for (index = 0; index < 7; index += 1) {
            var nextPositions = new Array(pointCount);

            for (innerIndex = 0; innerIndex < pointCount; innerIndex += 1) {
                var neighbors = points[innerIndex].neighbors.slice(0, Math.max(5, settings.neighbors));
                var weightSum = 0;
                var xSum = 0;
                var ySum = 0;
                var neighborIndex;

                for (neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex += 1) {
                    var weight = 1 / Math.max(neighbors[neighborIndex].dist, 0.0001);
                    xSum += positions[neighbors[neighborIndex].index].x * weight;
                    ySum += positions[neighbors[neighborIndex].index].y * weight;
                    weightSum += weight;
                }

                nextPositions[innerIndex] = {
                    x: positions[innerIndex].x * 0.78 + (xSum / Math.max(weightSum, 0.0001)) * 0.22,
                    y: positions[innerIndex].y * 0.78 + (ySum / Math.max(weightSum, 0.0001)) * 0.22
                };
            }

            positions = nextPositions;
        }

        var xs = positions.map(function (position) {
            return position.x;
        });
        var ys = positions.map(function (position) {
            return position.y;
        });
        var meanX = average(xs);
        var meanY = average(ys);
        var minX = Math.min.apply(null, xs);
        var maxX = Math.max.apply(null, xs);
        var minY = Math.min.apply(null, ys);
        var maxY = Math.max.apply(null, ys);
        var span = Math.max(maxX - minX, maxY - minY, 0.0001);

        for (index = 0; index < pointCount; index += 1) {
            positions[index].x = (positions[index].x - meanX) / span;
            positions[index].y = (positions[index].y - meanY) / span;
        }

        return positions;
    }

    function clusterWithEps(points, distances, epsilon, minPoints) {
        var pointCount = points.length;
        var visited = new Array(pointCount);
        var labels = new Array(pointCount);
        var clusterId = 0;
        var pointIndex;

        function regionQuery(index) {
            var matches = [];
            var candidateIndex;
            for (candidateIndex = 0; candidateIndex < pointCount; candidateIndex += 1) {
                if (distances[index][candidateIndex] <= epsilon) {
                    matches.push(candidateIndex);
                }
            }
            return matches;
        }

        for (pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
            if (visited[pointIndex]) {
                continue;
            }

            visited[pointIndex] = true;
            var neighbors = regionQuery(pointIndex);
            if (neighbors.length < minPoints) {
                labels[pointIndex] = -1;
                continue;
            }

            labels[pointIndex] = clusterId;
            var seedQueue = neighbors.slice();
            var queued = new Array(pointCount);
            var queueIndex;

            for (queueIndex = 0; queueIndex < seedQueue.length; queueIndex += 1) {
                queued[seedQueue[queueIndex]] = true;
            }

            queueIndex = 0;
            while (queueIndex < seedQueue.length) {
                var current = seedQueue[queueIndex];

                if (!visited[current]) {
                    visited[current] = true;
                    var currentNeighbors = regionQuery(current);
                    if (currentNeighbors.length >= minPoints) {
                        var neighborIndex;
                        for (neighborIndex = 0; neighborIndex < currentNeighbors.length; neighborIndex += 1) {
                            if (!queued[currentNeighbors[neighborIndex]]) {
                                queued[currentNeighbors[neighborIndex]] = true;
                                seedQueue.push(currentNeighbors[neighborIndex]);
                            }
                        }
                    }
                }

                if (labels[current] === undefined || labels[current] === -1) {
                    labels[current] = clusterId;
                }

                queueIndex += 1;
            }

            clusterId += 1;
        }

        return {
            labels: labels,
            clusterCount: clusterId,
            epsilon: epsilon
        };
    }

    function runDensityClustering(points, distances, settings) {
        var coreDistances = points.map(function (point) {
            return point.coreDistance;
        });
        var baseEpsilon = percentile(coreDistances, 0.55) * (0.92 + settings.overlap * 0.2 + settings.curl * 0.08);
        var minPoints = Math.max(4, settings.minCluster);
        var result = clusterWithEps(points, distances, baseEpsilon, minPoints);

        if (result.clusterCount === 0) {
            result = clusterWithEps(points, distances, baseEpsilon * 1.18, minPoints);
        }

        var noiseRatio = result.labels.filter(function (label) {
            return label === -1;
        }).length / Math.max(points.length, 1);

        if (noiseRatio > 0.42 && result.clusterCount < settings.clusters) {
            result = clusterWithEps(points, distances, result.epsilon * 1.08, minPoints);
        }

        return result;
    }

    function buildClusterInfo(points, positions, labels) {
        var clustersById = {};
        var pointIndex;
        var clusterKeys;
        var labelMap = {};
        var clusters;

        for (pointIndex = 0; pointIndex < labels.length; pointIndex += 1) {
            if (labels[pointIndex] < 0) {
                continue;
            }

            if (!clustersById[labels[pointIndex]]) {
                clustersById[labels[pointIndex]] = {
                    sourceId: labels[pointIndex],
                    indexes: [],
                    densitySum: 0
                };
            }

            clustersById[labels[pointIndex]].indexes.push(pointIndex);
            clustersById[labels[pointIndex]].densitySum += points[pointIndex].density;
        }

        clusterKeys = Object.keys(clustersById);
        clusters = clusterKeys.map(function (key) {
            return clustersById[key];
        }).sort(function (a, b) {
            return b.indexes.length - a.indexes.length;
        });

        clusters.forEach(function (cluster, index) {
            labelMap[cluster.sourceId] = index;
            cluster.id = index;
            cluster.size = cluster.indexes.length;
            cluster.color = palette[index % palette.length];
            cluster.meanDensity = cluster.densitySum / Math.max(cluster.size, 1);
        });

        for (pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
            if (labels[pointIndex] >= 0) {
                points[pointIndex].cluster = labelMap[labels[pointIndex]];
                points[pointIndex].color = palette[points[pointIndex].cluster % palette.length];
            } else {
                points[pointIndex].cluster = -1;
                points[pointIndex].color = '#94a3b8';
            }
        }

        clusters.forEach(function (cluster) {
            var xValues = [];
            var yValues = [];

            cluster.indexes.forEach(function (index) {
                xValues.push(positions[index].x);
                yValues.push(positions[index].y);
            });

            cluster.centroid = {
                x: average(xValues),
                y: average(yValues)
            };
        });

        return clusters;
    }

    function computeTrust(points, positions, settings) {
        var k = Math.max(4, Math.min(8, settings.neighbors, points.length - 1));
        var total = 0;
        var pointIndex;

        for (pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
            var highDimensionSet = {};
            var neighborIndex;

            for (neighborIndex = 0; neighborIndex < k; neighborIndex += 1) {
                highDimensionSet[points[pointIndex].neighbors[neighborIndex].index] = true;
            }

            var planarNeighbors = [];
            for (neighborIndex = 0; neighborIndex < points.length; neighborIndex += 1) {
                if (pointIndex === neighborIndex) {
                    continue;
                }

                planarNeighbors.push({
                    index: neighborIndex,
                    dist: Math.hypot(
                        positions[pointIndex].x - positions[neighborIndex].x,
                        positions[pointIndex].y - positions[neighborIndex].y
                    )
                });
            }

            planarNeighbors.sort(function (a, b) {
                return a.dist - b.dist;
            });

            var matches = 0;
            for (neighborIndex = 0; neighborIndex < k; neighborIndex += 1) {
                if (highDimensionSet[planarNeighbors[neighborIndex].index]) {
                    matches += 1;
                }
            }

            total += matches / k;
        }

        return total / Math.max(points.length, 1);
    }

    function computeSeparation(clusterInfo, positions) {
        if (clusterInfo.length < 2) {
            return 0;
        }

        var radii = [];
        var clusterIndex;
        var otherIndex;
        var minInterCluster = Infinity;

        for (clusterIndex = 0; clusterIndex < clusterInfo.length; clusterIndex += 1) {
            var cluster = clusterInfo[clusterIndex];
            var distancesToCenter = cluster.indexes.map(function (index) {
                return Math.hypot(
                    positions[index].x - cluster.centroid.x,
                    positions[index].y - cluster.centroid.y
                );
            });
            radii.push(average(distancesToCenter));
        }

        for (clusterIndex = 0; clusterIndex < clusterInfo.length; clusterIndex += 1) {
            for (otherIndex = clusterIndex + 1; otherIndex < clusterInfo.length; otherIndex += 1) {
                minInterCluster = Math.min(
                    minInterCluster,
                    Math.hypot(
                        clusterInfo[clusterIndex].centroid.x - clusterInfo[otherIndex].centroid.x,
                        clusterInfo[clusterIndex].centroid.y - clusterInfo[otherIndex].centroid.y
                    )
                );
            }
        }

        return minInterCluster / Math.max(average(radii), 0.04);
    }

    function updateNarrative(result, settings) {
        stats.groups.textContent = result.groupsFound.toString();
        stats.noise.textContent = formatPercent(result.noiseShare * 100, 0);
        stats.separation.textContent = result.separation.toFixed(1) + 'x';
        stats.trust.textContent = formatPercent(result.trust * 100, 0);

        if (result.groupsFound < settings.clusters - 1) {
            densityPill.textContent = 'Groups merged · ' + formatPercent(result.noiseShare * 100, 0) + ' noise';
        } else if (result.groupsFound > settings.clusters + 1) {
            densityPill.textContent = 'Micro-clusters · ' + formatPercent(result.noiseShare * 100, 0) + ' noise';
        } else {
            densityPill.textContent = result.groupsFound + ' groups · ' + formatPercent(result.noiseShare * 100, 0) + ' noise';
        }

        if (result.trust >= 0.72 && result.separation >= 1.85 && result.noiseShare < 0.22) {
            embeddingPill.textContent = 'Topology holds';
            notePanel.textContent = 'Local neighborhoods are surviving the projection and the density cut is still finding stable groups. This is the kind of map where a cluster story feels defensible instead of decorative.';
        } else if (result.trust >= 0.58 && result.separation >= 1.2) {
            embeddingPill.textContent = 'Boundary blur';
            notePanel.textContent = 'The manifold is still readable, but overlap is beginning to smear nearby groups together. This is where neighborhood size and minimum cluster thresholds become modeling choices, not defaults.';
        } else {
            embeddingPill.textContent = 'Projection strain';
            notePanel.textContent = 'High overlap or aggressive curvature is overwhelming the local geometry. The map is warning that a clean cluster narrative may be more wishful than real.';
        }
    }

    function drawEmbeddingCanvas(result) {
        var width = parseFloat(embeddingCanvas.style.width) || 600;
        var height = parseFloat(embeddingCanvas.style.height) || 320;
        var padding = { top: 22, right: 18, bottom: 18, left: 18 };
        var plotWidth = width - padding.left - padding.right;
        var plotHeight = height - padding.top - padding.bottom;
        var xValues = result.positions.map(function (position) {
            return position.x;
        });
        var yValues = result.positions.map(function (position) {
            return position.y;
        });
        var minX = Math.min.apply(null, xValues);
        var maxX = Math.max.apply(null, xValues);
        var minY = Math.min.apply(null, yValues);
        var maxY = Math.max.apply(null, yValues);
        var rangeX = Math.max(maxX - minX, 0.0001);
        var rangeY = Math.max(maxY - minY, 0.0001);
        var densityValues = result.points.map(function (point) {
            return point.density;
        });
        var minDensity = Math.min.apply(null, densityValues);
        var maxDensity = Math.max.apply(null, densityValues);
        var edgeBudget = 56;

        function xToCanvas(value) {
            return padding.left + ((value - minX) / rangeX) * plotWidth;
        }

        function yToCanvas(value) {
            return padding.top + plotHeight - ((value - minY) / rangeY) * plotHeight;
        }

        embeddingContext.clearRect(0, 0, width, height);

        var background = embeddingContext.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#041018');
        background.addColorStop(1, '#08141f');
        embeddingContext.fillStyle = background;
        embeddingContext.fillRect(0, 0, width, height);

        embeddingContext.save();
        embeddingContext.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        embeddingContext.lineWidth = 1;
        var column;
        var row;
        for (column = 0; column <= 4; column += 1) {
            var x = padding.left + plotWidth * (column / 4);
            embeddingContext.beginPath();
            embeddingContext.moveTo(x, padding.top);
            embeddingContext.lineTo(x, padding.top + plotHeight);
            embeddingContext.stroke();
        }
        for (row = 0; row <= 3; row += 1) {
            var y = padding.top + plotHeight * (row / 3);
            embeddingContext.beginPath();
            embeddingContext.moveTo(padding.left, y);
            embeddingContext.lineTo(padding.left + plotWidth, y);
            embeddingContext.stroke();
        }
        embeddingContext.restore();

        embeddingContext.save();
        embeddingContext.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        embeddingContext.lineWidth = 1;
        result.points.forEach(function (point, index) {
            if (edgeBudget <= 0 || point.cluster < 0 || index % 4 !== 0) {
                return;
            }

            var targetIndex = -1;
            var neighborIndex;
            for (neighborIndex = 0; neighborIndex < Math.min(4, point.neighbors.length); neighborIndex += 1) {
                if (result.points[point.neighbors[neighborIndex].index].cluster === point.cluster) {
                    targetIndex = point.neighbors[neighborIndex].index;
                    break;
                }
            }

            if (targetIndex < 0) {
                return;
            }

            embeddingContext.beginPath();
            embeddingContext.moveTo(xToCanvas(result.positions[index].x), yToCanvas(result.positions[index].y));
            embeddingContext.lineTo(xToCanvas(result.positions[targetIndex].x), yToCanvas(result.positions[targetIndex].y));
            embeddingContext.stroke();
            edgeBudget -= 1;
        });
        embeddingContext.restore();

        result.points.forEach(function (point, index) {
            var normalizedDensity = (point.density - minDensity) / Math.max(maxDensity - minDensity, 0.0001);
            var radius = point.cluster < 0 ? 2.6 : 3.1 + normalizedDensity * 1.8;
            var x = xToCanvas(result.positions[index].x);
            var y = yToCanvas(result.positions[index].y);

            embeddingContext.save();
            embeddingContext.fillStyle = point.color;
            embeddingContext.globalAlpha = point.cluster < 0 ? 0.6 : 0.88;
            embeddingContext.shadowColor = point.cluster < 0 ? 'rgba(148, 163, 184, 0.18)' : point.color;
            embeddingContext.shadowBlur = point.cluster < 0 ? 6 : 12;
            embeddingContext.beginPath();
            embeddingContext.arc(x, y, radius, 0, Math.PI * 2);
            embeddingContext.fill();
            embeddingContext.restore();
        });

        result.clusterInfo.slice(0, 5).forEach(function (cluster) {
            embeddingContext.save();
            embeddingContext.fillStyle = cluster.color;
            embeddingContext.font = '700 11px Hind, sans-serif';
            embeddingContext.textAlign = 'left';
            embeddingContext.fillText(
                'G' + (cluster.id + 1) + ' · ' + cluster.size,
                xToCanvas(cluster.centroid.x) + 9,
                yToCanvas(cluster.centroid.y) - 9
            );
            embeddingContext.restore();
        });

        embeddingContext.save();
        embeddingContext.fillStyle = '#e2e8f0';
        embeddingContext.font = '700 12px Hind, sans-serif';
        embeddingContext.fillText('Neighborhood map', padding.left, padding.top + 2);
        embeddingContext.fillStyle = '#94a3b8';
        embeddingContext.font = '12px Hind, sans-serif';
        embeddingContext.fillText('Color shows density groups, gray marks noise and border cases', padding.left, padding.top + 20);
        embeddingContext.restore();
    }

    function drawDensityCanvas(result) {
        var width = parseFloat(densityCanvas.style.width) || 600;
        var height = parseFloat(densityCanvas.style.height) || 240;
        var padding = { top: 24, right: 18, bottom: 56, left: 40 };
        var plotWidth = width - padding.left - padding.right;
        var plotHeight = height - padding.top - padding.bottom;
        var sorted = result.sortedCoreDistances;
        var yMax = Math.max(sorted[sorted.length - 1] * 1.08, result.epsilon * 1.18, 0.0001);
        var cutIndex = sorted.length - 1;
        var index;

        for (index = 0; index < sorted.length; index += 1) {
            if (sorted[index] >= result.epsilon) {
                cutIndex = index;
                break;
            }
        }

        function xToCanvas(position) {
            if (sorted.length <= 1) {
                return padding.left;
            }
            return padding.left + (position / (sorted.length - 1)) * plotWidth;
        }

        function yToCanvas(value) {
            return padding.top + plotHeight - (value / yMax) * plotHeight;
        }

        densityContext.clearRect(0, 0, width, height);
        densityContext.fillStyle = '#07111a';
        densityContext.fillRect(0, 0, width, height);

        densityContext.save();
        densityContext.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        densityContext.lineWidth = 1;
        var row;
        for (row = 0; row <= 3; row += 1) {
            var y = padding.top + plotHeight * (row / 3);
            densityContext.beginPath();
            densityContext.moveTo(padding.left, y);
            densityContext.lineTo(padding.left + plotWidth, y);
            densityContext.stroke();
        }
        densityContext.restore();

        densityContext.save();
        densityContext.fillStyle = 'rgba(249, 115, 22, 0.08)';
        densityContext.fillRect(xToCanvas(cutIndex), padding.top, plotWidth - (xToCanvas(cutIndex) - padding.left), plotHeight);
        densityContext.restore();

        densityContext.save();
        densityContext.beginPath();
        densityContext.moveTo(xToCanvas(0), yToCanvas(sorted[0]));
        for (index = 1; index < sorted.length; index += 1) {
            densityContext.lineTo(xToCanvas(index), yToCanvas(sorted[index]));
        }
        densityContext.lineTo(xToCanvas(sorted.length - 1), yToCanvas(0));
        densityContext.lineTo(xToCanvas(0), yToCanvas(0));
        densityContext.closePath();
        var fill = densityContext.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
        fill.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
        fill.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
        densityContext.fillStyle = fill;
        densityContext.fill();
        densityContext.restore();

        densityContext.save();
        densityContext.beginPath();
        for (index = 0; index < sorted.length; index += 1) {
            if (index === 0) {
                densityContext.moveTo(xToCanvas(index), yToCanvas(sorted[index]));
            } else {
                densityContext.lineTo(xToCanvas(index), yToCanvas(sorted[index]));
            }
        }
        densityContext.strokeStyle = '#5eead4';
        densityContext.lineWidth = 2.2;
        densityContext.stroke();
        densityContext.restore();

        densityContext.save();
        densityContext.setLineDash([7, 6]);
        densityContext.strokeStyle = '#fb923c';
        densityContext.lineWidth = 1.6;
        densityContext.beginPath();
        densityContext.moveTo(padding.left, yToCanvas(result.epsilon));
        densityContext.lineTo(padding.left + plotWidth, yToCanvas(result.epsilon));
        densityContext.stroke();
        densityContext.restore();

        densityContext.save();
        densityContext.fillStyle = '#f8fafc';
        densityContext.font = '700 12px Hind, sans-serif';
        densityContext.fillText('Sorted core-distance curve', padding.left, padding.top - 4);
        densityContext.fillStyle = '#94a3b8';
        densityContext.font = '12px Hind, sans-serif';
        densityContext.fillText('Points above the cut behave more like border cases or noise', padding.left, padding.top + 14);
        densityContext.fillStyle = '#fb923c';
        densityContext.fillText('Density cut', padding.left + 6, yToCanvas(result.epsilon) - 8);
        densityContext.restore();

        densityContext.save();
        densityContext.textBaseline = 'middle';
        densityContext.font = '11px Hind, sans-serif';
        var legendX = padding.left;
        result.clusterInfo.slice(0, 4).forEach(function (cluster) {
            densityContext.fillStyle = cluster.color;
            densityContext.fillRect(legendX, height - 26, 11, 11);
            densityContext.fillStyle = '#dbeafe';
            densityContext.fillText('G' + (cluster.id + 1) + ' ' + cluster.size, legendX + 16, height - 20.5);
            legendX += 76;
        });
        densityContext.fillStyle = '#94a3b8';
        densityContext.fillRect(legendX, height - 26, 11, 11);
        densityContext.fillStyle = '#dbeafe';
        densityContext.fillText('Noise ' + formatPercent(result.noiseShare * 100, 0), legendX + 16, height - 20.5);
        densityContext.restore();
    }

    function calculateResult() {
        var settings = getSettings();
        var dataset = generateDataset(settings);
        annotateNeighborhood(dataset.points, dataset.distances, settings);
        var positions = buildEmbedding(dataset.points, dataset.distances, settings);
        var clustering = runDensityClustering(dataset.points, dataset.distances, settings);
        var clusterInfo = buildClusterInfo(dataset.points, positions, clustering.labels);
        var noiseCount = dataset.points.filter(function (point) {
            return point.cluster < 0;
        }).length;
        var trust = computeTrust(dataset.points, positions, settings);
        var separation = computeSeparation(clusterInfo, positions);

        return {
            settings: settings,
            points: dataset.points,
            positions: positions,
            clusterInfo: clusterInfo,
            groupsFound: clusterInfo.length,
            noiseShare: noiseCount / Math.max(dataset.points.length, 1),
            trust: trust,
            separation: separation,
            epsilon: clustering.epsilon,
            sortedCoreDistances: dataset.points.map(function (point) {
                return point.coreDistance;
            }).sort(function (a, b) {
                return a - b;
            })
        };
    }

    function render() {
        state.result = calculateResult();
        updateNarrative(state.result, state.result.settings);
        setCanvasSize(embeddingCanvas, embeddingContext, 0.52, 290);
        setCanvasSize(densityCanvas, densityContext, 0.34, 220);
        drawEmbeddingCanvas(state.result);
        drawDensityCanvas(state.result);
    }

    Object.keys(controls).forEach(function (key) {
        controls[key].addEventListener('input', function () {
            updateOutputs();
            markCustomPreset();
            render();
        });
    });

    presetButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            applyPreset(button.getAttribute('data-ml-preset'));
        });
    });

    window.addEventListener('resize', function () {
        clearTimeout(state.resizeTimer);
        state.resizeTimer = setTimeout(render, 80);
    });

    if (window.jQuery) {
        window.jQuery('#myTab a[href="#fun"]').on('shown.bs.tab', function () {
            setTimeout(render, 80);
        });
    }

    applyPreset('customer');
}
