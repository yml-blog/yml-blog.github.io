document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('monte-carlo-lab');
    if (!root) {
        return;
    }

    var pathCanvas = document.getElementById('mc-path-canvas');
    var distributionCanvas = document.getElementById('mc-distribution-canvas');
    if (!pathCanvas || !distributionCanvas || !pathCanvas.getContext || !distributionCanvas.getContext) {
        return;
    }

    var pathContext = pathCanvas.getContext('2d');
    var distributionContext = distributionCanvas.getContext('2d');
    var livePill = document.getElementById('mc-live-pill');
    var histogramSummary = document.getElementById('mc-hist-summary');
    var scenarioCopy = document.getElementById('mc-scenario-copy');
    var notePanel = document.getElementById('mc-note-panel');
    var storyTitle = document.getElementById('mc-story-title');
    var storyBody = document.getElementById('mc-story-body');
    var riskTitle = document.getElementById('mc-risk-title');
    var riskBody = document.getElementById('mc-risk-body');
    var decisionTitle = document.getElementById('mc-decision-title');
    var decisionBody = document.getElementById('mc-decision-body');
    var runButton = document.getElementById('mc-run-button');
    var remixButton = document.getElementById('mc-remix-button');
    var presetButtons = Array.prototype.slice.call(root.querySelectorAll('.mc-preset'));

    var controlIds = ['start', 'drift', 'volatility', 'horizon', 'simulations', 'target'];
    var controls = {};
    var outputs = {};

    controlIds.forEach(function (key) {
        controls[key] = document.getElementById('mc-' + key);
        outputs[key] = document.getElementById('mc-' + key + '-value');
    });

    var statTargets = {
        successRate: document.getElementById('mc-success-rate'),
        meanFinish: document.getElementById('mc-mean-finish'),
        medianFinish: document.getElementById('mc-median-finish'),
        rangeBand: document.getElementById('mc-range-band')
    };

    var PRESETS = {
        steady: {
            start: 100,
            drift: 45,
            volatility: 180,
            horizon: 72,
            simulations: 900,
            target: 135,
            blurb: 'A balanced review setup where the hurdle still feels reachable, but the tail risk is visible enough to force a real decision.',
            storyTitle: 'Quarter-close risk review',
            storyBody: 'A lead is checking whether the plan still clears its hurdle before committing more capital, timeline, or scope.',
            riskTitle: 'Variance can overpower the base case',
            riskBody: 'The center line may look calm, but a few bad shocks widen the tail quickly and change the story for stakeholders.',
            decisionTitle: 'Adjust before review day',
            decisionBody: 'Lower the hurdle, extend the horizon, or reduce exposure and scope if the success odds drift too low.'
        },
        moonshot: {
            start: 100,
            drift: 75,
            volatility: 320,
            horizon: 96,
            simulations: 1200,
            target: 185,
            blurb: 'This is the stretch-plan version: high upside if execution goes right, but a much wider tail if late shocks arrive.',
            storyTitle: 'High-conviction growth or launch push',
            storyBody: 'The team is chasing a breakout quarter or an ambitious launch, knowing the upside is real but fragile.',
            riskTitle: 'Success depends on a few strong runs',
            riskBody: 'Median outcomes look respectable, yet the business case is still being carried by a smaller set of breakout scenarios.',
            decisionTitle: 'Decide how much risk to fund',
            decisionBody: 'If confidence stays middling, split the plan into stages instead of betting the whole roadmap or portfolio at once.'
        },
        turbulence: {
            start: 100,
            drift: 15,
            volatility: 460,
            horizon: 84,
            simulations: 1400,
            target: 125,
            blurb: 'This is the stress case: momentum is weak, shocks are frequent, and the tail risk becomes the real story.',
            storyTitle: 'Recovery plan under pressure',
            storyBody: 'Leadership is trying to preserve runway or salvage a schedule while the environment keeps introducing new friction.',
            riskTitle: 'Tail losses show up fast',
            riskBody: 'When drift is small and shocks are large, a handful of bad paths can redefine the planning conversation immediately.',
            decisionTitle: 'Protect downside first',
            decisionBody: 'Before chasing upside, tighten controls, reduce exposure, and give the plan more buffer to survive turbulence.'
        }
    };

    var state = {
        currentPreset: 'steady',
        results: null,
        progressStep: 0,
        animationFrameId: null,
        animationStartTime: null,
        resizeTimer: null
    };

    function formatInteger(value) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(Math.round(value));
    }

    function formatPercentFromBasisPoints(value, signed) {
        var numeric = value / 100;
        var prefix = signed && numeric > 0 ? '+' : '';
        return prefix + numeric.toFixed(2) + '%';
    }

    function updateControlOutputs() {
        outputs.start.textContent = formatInteger(parseFloat(controls.start.value));
        outputs.drift.textContent = formatPercentFromBasisPoints(parseFloat(controls.drift.value), true);
        outputs.volatility.textContent = formatPercentFromBasisPoints(parseFloat(controls.volatility.value), false);
        outputs.horizon.textContent = formatInteger(parseFloat(controls.horizon.value));
        outputs.simulations.textContent = formatInteger(parseFloat(controls.simulations.value));
        outputs.target.textContent = formatInteger(parseFloat(controls.target.value));
    }

    function readSettings() {
        return {
            start: parseFloat(controls.start.value),
            drift: parseFloat(controls.drift.value),
            volatility: parseFloat(controls.volatility.value),
            horizon: parseInt(controls.horizon.value, 10),
            simulations: parseInt(controls.simulations.value, 10),
            target: parseFloat(controls.target.value)
        };
    }

    function setPresetButtonState(activeKey) {
        presetButtons.forEach(function (button) {
            var isActive = button.getAttribute('data-preset') === activeKey;
            button.classList.toggle('is-active', isActive);
        });
    }

    function markCustomScenario() {
        state.currentPreset = 'custom';
        setPresetButtonState('__none__');
        scenarioCopy.textContent = 'Custom mix: move the assumptions until the story feels like your real review, then watch how the tails reshape around the hurdle.';
        updateStoryPanel({
            storyTitle: 'Custom risk review',
            storyBody: 'You are no longer reading a canned case. This run is meant to mirror the real tradeoffs in front of you.',
            riskTitle: 'Look for the pressure point',
            riskBody: 'The most useful lever is the one that changes the tail, not just the center line.',
            decisionTitle: 'Ask what must change',
            decisionBody: 'If the hurdle still looks weak after resampling, the plan probably needs a structural change, not better storytelling.'
        });
    }

    function updateStoryPanel(preset) {
        if (!preset) {
            return;
        }

        storyTitle.textContent = preset.storyTitle;
        storyBody.textContent = preset.storyBody;
        riskTitle.textContent = preset.riskTitle;
        riskBody.textContent = preset.riskBody;
        decisionTitle.textContent = preset.decisionTitle;
        decisionBody.textContent = preset.decisionBody;
    }

    function applyPreset(name, shouldRun) {
        var preset = PRESETS[name];
        if (!preset) {
            return;
        }

        state.currentPreset = name;
        controls.start.value = preset.start;
        controls.drift.value = preset.drift;
        controls.volatility.value = preset.volatility;
        controls.horizon.value = preset.horizon;
        controls.simulations.value = preset.simulations;
        controls.target.value = preset.target;
        updateControlOutputs();
        setPresetButtonState(name);
        scenarioCopy.textContent = preset.blurb;
        updateStoryPanel(preset);

        if (shouldRun) {
            runSimulation();
        }
    }

    function randomNormal() {
        var u = 0;
        var v = 0;

        while (u === 0) {
            u = Math.random();
        }

        while (v === 0) {
            v = Math.random();
        }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function percentile(sortedValues, ratio) {
        if (!sortedValues.length) {
            return 0;
        }

        var index = (sortedValues.length - 1) * ratio;
        var lower = Math.floor(index);
        var upper = Math.ceil(index);

        if (lower === upper) {
            return sortedValues[lower];
        }

        var weight = index - lower;
        return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
    }

    function createSamplePaths(allPaths, desiredCount) {
        var count = Math.min(desiredCount, allPaths.length);
        if (!count) {
            return [];
        }

        var step = allPaths.length / count;
        var selection = [];

        for (var i = 0; i < count; i += 1) {
            selection.push(allPaths[Math.floor(i * step)]);
        }

        return selection;
    }

    function buildHistogram(values, target, binCount) {
        var minValue = Math.min.apply(null, values.concat([target]));
        var maxValue = Math.max.apply(null, values.concat([target]));
        var spread = maxValue - minValue;
        var padding = spread > 0 ? spread * 0.08 : maxValue * 0.08;
        var lowerBound = Math.max(0, minValue - padding);
        var upperBound = maxValue + padding + 1;
        var width = (upperBound - lowerBound) / binCount;
        var bins = [];

        for (var i = 0; i < binCount; i += 1) {
            bins.push({
                start: lowerBound + (width * i),
                end: lowerBound + (width * (i + 1)),
                count: 0
            });
        }

        values.forEach(function (value) {
            var index = Math.floor((value - lowerBound) / width);
            var safeIndex = Math.max(0, Math.min(binCount - 1, index));
            bins[safeIndex].count += 1;
        });

        return {
            bins: bins,
            maxCount: Math.max.apply(null, bins.map(function (bin) {
                return bin.count;
            }).concat([1])),
            lowerBound: lowerBound,
            upperBound: upperBound
        };
    }

    function summarizeSimulation(settings) {
        var drift = settings.drift / 10000;
        var volatility = settings.volatility / 10000;
        var horizon = settings.horizon;
        var trials = settings.simulations;
        var start = settings.start;
        var target = settings.target;
        var allPaths = new Array(trials);
        var stepMatrix = Array.from({ length: horizon + 1 }, function () {
            return new Array(trials);
        });
        var finals = new Array(trials);
        var successCount = 0;
        var total = 0;

        for (var trialIndex = 0; trialIndex < trials; trialIndex += 1) {
            var path = new Array(horizon + 1);
            var value = start;
            path[0] = value;
            stepMatrix[0][trialIndex] = value;

            for (var stepIndex = 1; stepIndex <= horizon; stepIndex += 1) {
                var shock = randomNormal();
                value = Math.max(5, value * Math.exp((drift - (0.5 * volatility * volatility)) + (volatility * shock)));
                path[stepIndex] = value;
                stepMatrix[stepIndex][trialIndex] = value;
            }

            allPaths[trialIndex] = path;
            finals[trialIndex] = value;
            total += value;
            if (value >= target) {
                successCount += 1;
            }
        }

        var bands = stepMatrix.map(function (column) {
            var sorted = column.slice().sort(function (left, right) {
                return left - right;
            });

            return {
                p10: percentile(sorted, 0.10),
                p25: percentile(sorted, 0.25),
                p50: percentile(sorted, 0.50),
                p75: percentile(sorted, 0.75),
                p90: percentile(sorted, 0.90)
            };
        });

        var samplePaths = createSamplePaths(allPaths, 120);
        var finalsSorted = finals.slice().sort(function (left, right) {
            return left - right;
        });
        var histogram = buildHistogram(finals, target, 28);
        var displayedMin = Math.min(start, target);
        var displayedMax = Math.max(start, target);

        samplePaths.forEach(function (path) {
            path.forEach(function (value) {
                if (value < displayedMin) {
                    displayedMin = value;
                }
                if (value > displayedMax) {
                    displayedMax = value;
                }
            });
        });

        bands.forEach(function (band) {
            displayedMin = Math.min(displayedMin, band.p10);
            displayedMax = Math.max(displayedMax, band.p90);
        });

        return {
            settings: settings,
            samplePaths: samplePaths,
            bands: bands,
            histogram: histogram,
            stats: {
                successRate: successCount / trials,
                meanFinish: total / trials,
                medianFinish: percentile(finalsSorted, 0.50),
                lowBand: percentile(finalsSorted, 0.10),
                highBand: percentile(finalsSorted, 0.90)
            },
            domain: {
                min: Math.max(0, displayedMin * 0.92),
                max: displayedMax * 1.08
            }
        };
    }

    function setCanvasSize(canvas, context, cssWidth, cssHeight) {
        var devicePixelRatioValue = window.devicePixelRatio || 1;
        canvas.width = Math.round(cssWidth * devicePixelRatioValue);
        canvas.height = Math.round(cssHeight * devicePixelRatioValue);
        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';
        context.setTransform(devicePixelRatioValue, 0, 0, devicePixelRatioValue, 0, 0);
    }

    function getCanvasWidth(canvas, fallbackMax) {
        var parent = canvas.parentElement;
        if (parent && parent.clientWidth > 220) {
            var styles = window.getComputedStyle(parent);
            var paddingLeft = parseFloat(styles.paddingLeft) || 0;
            var paddingRight = parseFloat(styles.paddingRight) || 0;
            return Math.max(320, parent.clientWidth - paddingLeft - paddingRight);
        }

        return Math.max(320, Math.min((window.innerWidth || fallbackMax) - 48, fallbackMax));
    }

    function resizeCanvases() {
        var pathWidth = getCanvasWidth(pathCanvas, 780);
        var distributionWidth = getCanvasWidth(distributionCanvas, 780);
        var pathHeight = Math.max(280, Math.round(pathWidth * 0.55));
        var distributionHeight = Math.max(200, Math.round(distributionWidth * 0.34));

        setCanvasSize(pathCanvas, pathContext, pathWidth, pathHeight);
        setCanvasSize(distributionCanvas, distributionContext, distributionWidth, distributionHeight);
    }

    function getChartBounds(canvas) {
        return {
            width: parseFloat(canvas.style.width) || (canvas.width / (window.devicePixelRatio || 1)),
            height: parseFloat(canvas.style.height) || (canvas.height / (window.devicePixelRatio || 1))
        };
    }

    function valueToY(value, domainMin, domainMax, top, plotHeight) {
        var ratio = (value - domainMin) / (domainMax - domainMin || 1);
        return top + plotHeight - (ratio * plotHeight);
    }

    function stepToX(step, totalSteps, left, plotWidth) {
        return left + ((step / (totalSteps || 1)) * plotWidth);
    }

    function drawGrid(context, horizon, left, top, plotWidth, plotHeight, domainMin, domainMax) {
        context.save();
        context.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        context.lineWidth = 1;
        context.font = '12px Hind, sans-serif';
        context.fillStyle = 'rgba(226, 232, 240, 0.75)';
        context.textAlign = 'right';
        context.textBaseline = 'middle';

        for (var row = 0; row <= 4; row += 1) {
            var y = top + ((plotHeight / 4) * row);
            var labelValue = domainMax - (((domainMax - domainMin) / 4) * row);

            context.beginPath();
            context.moveTo(left, y);
            context.lineTo(left + plotWidth, y);
            context.stroke();
            context.fillText(formatInteger(labelValue), left - 10, y);
        }

        context.textAlign = 'center';
        context.textBaseline = 'top';

        for (var column = 0; column <= 5; column += 1) {
            var x = left + ((plotWidth / 5) * column);
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, top + plotHeight);
            context.stroke();
            context.fillText(formatInteger((horizon / 5) * column), x, top + plotHeight + 10);
        }

        context.restore();
    }

    function drawThresholdLine(context, left, plotWidth, targetY, targetValue) {
        context.save();
        context.setLineDash([8, 8]);
        context.lineWidth = 1.5;
        context.strokeStyle = '#fb923c';
        context.beginPath();
        context.moveTo(left, targetY);
        context.lineTo(left + plotWidth, targetY);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = '#fed7aa';
        context.font = '600 12px Hind, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillText('Target ' + formatInteger(targetValue), left + 10, targetY - 8);
        context.restore();
    }

    function drawBand(context, pointsTop, pointsBottom, fillStyle) {
        if (!pointsTop.length || !pointsBottom.length) {
            return;
        }

        context.save();
        context.beginPath();
        context.moveTo(pointsTop[0].x, pointsTop[0].y);
        pointsTop.forEach(function (point) {
            context.lineTo(point.x, point.y);
        });
        for (var index = pointsBottom.length - 1; index >= 0; index -= 1) {
            context.lineTo(pointsBottom[index].x, pointsBottom[index].y);
        }
        context.closePath();
        context.fillStyle = fillStyle;
        context.fill();
        context.restore();
    }

    function drawPathChart(progressStep) {
        if (!state.results) {
            return;
        }

        var bounds = getChartBounds(pathCanvas);
        var padding = {
            top: 28,
            right: 18,
            bottom: 42,
            left: 56
        };
        var plotWidth = bounds.width - padding.left - padding.right;
        var plotHeight = bounds.height - padding.top - padding.bottom;
        var domainMin = state.results.domain.min;
        var domainMax = state.results.domain.max;
        var totalSteps = state.results.settings.horizon;
        var targetY = valueToY(state.results.settings.target, domainMin, domainMax, padding.top, plotHeight);

        pathContext.clearRect(0, 0, bounds.width, bounds.height);

        var background = pathContext.createLinearGradient(0, 0, 0, bounds.height);
        background.addColorStop(0, '#0f1a2b');
        background.addColorStop(1, '#070c15');
        pathContext.fillStyle = background;
        pathContext.fillRect(0, 0, bounds.width, bounds.height);

        drawGrid(pathContext, totalSteps, padding.left, padding.top, plotWidth, plotHeight, domainMin, domainMax);
        drawThresholdLine(pathContext, padding.left, plotWidth, targetY, state.results.settings.target);

        var outerHigh = [];
        var outerLow = [];
        var innerHigh = [];
        var innerLow = [];
        var medianLine = [];

        for (var step = 0; step <= progressStep; step += 1) {
            var band = state.results.bands[step];
            var x = stepToX(step, totalSteps, padding.left, plotWidth);

            outerHigh.push({ x: x, y: valueToY(band.p90, domainMin, domainMax, padding.top, plotHeight) });
            outerLow.push({ x: x, y: valueToY(band.p10, domainMin, domainMax, padding.top, plotHeight) });
            innerHigh.push({ x: x, y: valueToY(band.p75, domainMin, domainMax, padding.top, plotHeight) });
            innerLow.push({ x: x, y: valueToY(band.p25, domainMin, domainMax, padding.top, plotHeight) });
            medianLine.push({ x: x, y: valueToY(band.p50, domainMin, domainMax, padding.top, plotHeight) });
        }

        drawBand(pathContext, outerHigh, outerLow, 'rgba(34, 211, 238, 0.14)');
        drawBand(pathContext, innerHigh, innerLow, 'rgba(125, 211, 252, 0.18)');

        pathContext.save();
        pathContext.beginPath();
        medianLine.forEach(function (point, index) {
            if (index === 0) {
                pathContext.moveTo(point.x, point.y);
            } else {
                pathContext.lineTo(point.x, point.y);
            }
        });
        pathContext.strokeStyle = 'rgba(248, 250, 252, 0.82)';
        pathContext.lineWidth = 2;
        pathContext.stroke();
        pathContext.restore();

        var particleCount = Math.min(20, state.results.samplePaths.length);
        state.results.samplePaths.forEach(function (path, pathIndex) {
            pathContext.save();
            pathContext.beginPath();

            for (var index = 0; index <= progressStep; index += 1) {
                var pathX = stepToX(index, totalSteps, padding.left, plotWidth);
                var pathY = valueToY(path[index], domainMin, domainMax, padding.top, plotHeight);

                if (index === 0) {
                    pathContext.moveTo(pathX, pathY);
                } else {
                    pathContext.lineTo(pathX, pathY);
                }
            }

            pathContext.strokeStyle = pathIndex % 5 === 0 ? 'rgba(103, 232, 249, 0.34)' : 'rgba(125, 211, 252, 0.18)';
            pathContext.lineWidth = pathIndex % 5 === 0 ? 1.7 : 1.1;
            pathContext.stroke();
            pathContext.restore();

            if (pathIndex < particleCount) {
                var particleX = stepToX(progressStep, totalSteps, padding.left, plotWidth);
                var particleY = valueToY(path[progressStep], domainMin, domainMax, padding.top, plotHeight);
                pathContext.save();
                pathContext.fillStyle = 'rgba(186, 230, 253, 0.96)';
                pathContext.shadowBlur = 16;
                pathContext.shadowColor = 'rgba(56, 189, 248, 0.55)';
                pathContext.beginPath();
                pathContext.arc(particleX, particleY, 2.4, 0, Math.PI * 2);
                pathContext.fill();
                pathContext.restore();
            }
        });

        pathContext.save();
        pathContext.fillStyle = '#7dd3fc';
        pathContext.font = '600 12px Hind, sans-serif';
        pathContext.textAlign = 'left';
        pathContext.textBaseline = 'top';
        pathContext.fillText('Value', 16, 10);
        pathContext.textAlign = 'right';
        pathContext.fillText('Time step', padding.left + plotWidth, bounds.height - 22);
        pathContext.restore();
    }

    function drawRoundedBar(context, x, y, width, height, radius) {
        var safeRadius = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + safeRadius, y);
        context.lineTo(x + width - safeRadius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
        context.lineTo(x + width, y + height - safeRadius);
        context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
        context.lineTo(x + safeRadius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
        context.lineTo(x, y + safeRadius);
        context.quadraticCurveTo(x, y, x + safeRadius, y);
        context.closePath();
    }

    function drawDistributionChart() {
        if (!state.results) {
            return;
        }

        var bounds = getChartBounds(distributionCanvas);
        var padding = {
            top: 24,
            right: 18,
            bottom: 38,
            left: 44
        };
        var plotWidth = bounds.width - padding.left - padding.right;
        var plotHeight = bounds.height - padding.top - padding.bottom;
        var histogram = state.results.histogram;
        var barWidth = plotWidth / histogram.bins.length;

        distributionContext.clearRect(0, 0, bounds.width, bounds.height);
        distributionContext.fillStyle = '#0b1220';
        distributionContext.fillRect(0, 0, bounds.width, bounds.height);

        distributionContext.save();
        distributionContext.strokeStyle = 'rgba(148, 163, 184, 0.16)';
        distributionContext.lineWidth = 1;

        for (var row = 0; row <= 3; row += 1) {
            var y = padding.top + ((plotHeight / 3) * row);
            distributionContext.beginPath();
            distributionContext.moveTo(padding.left, y);
            distributionContext.lineTo(padding.left + plotWidth, y);
            distributionContext.stroke();
        }

        distributionContext.restore();

        histogram.bins.forEach(function (bin, index) {
            var height = (bin.count / histogram.maxCount) * (plotHeight - 6);
            var x = padding.left + (index * barWidth) + 2;
            var y = padding.top + plotHeight - height;
            var width = Math.max(6, barWidth - 4);
            var isSuccessBin = bin.end >= state.results.settings.target;
            var gradient = distributionContext.createLinearGradient(0, y, 0, y + height);

            if (isSuccessBin) {
                gradient.addColorStop(0, 'rgba(45, 212, 191, 0.94)');
                gradient.addColorStop(1, 'rgba(14, 165, 233, 0.84)');
            } else {
                gradient.addColorStop(0, 'rgba(96, 165, 250, 0.82)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.42)');
            }

            distributionContext.save();
            distributionContext.fillStyle = gradient;
            drawRoundedBar(distributionContext, x, y, width, height, 6);
            distributionContext.fill();
            distributionContext.restore();
        });

        var xMin = histogram.lowerBound;
        var xMax = histogram.upperBound;
        var targetX = padding.left + (((state.results.settings.target - xMin) / (xMax - xMin || 1)) * plotWidth);
        var meanX = padding.left + (((state.results.stats.meanFinish - xMin) / (xMax - xMin || 1)) * plotWidth);
        var medianX = padding.left + (((state.results.stats.medianFinish - xMin) / (xMax - xMin || 1)) * plotWidth);

        distributionContext.save();
        distributionContext.setLineDash([7, 7]);
        distributionContext.strokeStyle = '#fb923c';
        distributionContext.lineWidth = 1.5;
        distributionContext.beginPath();
        distributionContext.moveTo(targetX, padding.top);
        distributionContext.lineTo(targetX, padding.top + plotHeight);
        distributionContext.stroke();
        distributionContext.restore();

        distributionContext.save();
        distributionContext.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        distributionContext.lineWidth = 1.5;
        distributionContext.beginPath();
        distributionContext.moveTo(meanX, padding.top + 10);
        distributionContext.lineTo(meanX, padding.top + plotHeight);
        distributionContext.stroke();
        distributionContext.strokeStyle = 'rgba(125, 211, 252, 0.92)';
        distributionContext.beginPath();
        distributionContext.moveTo(medianX, padding.top + 10);
        distributionContext.lineTo(medianX, padding.top + plotHeight);
        distributionContext.stroke();
        distributionContext.restore();

        distributionContext.save();
        distributionContext.font = '12px Hind, sans-serif';
        distributionContext.fillStyle = 'rgba(226, 232, 240, 0.74)';
        distributionContext.textAlign = 'left';
        distributionContext.fillText(formatInteger(xMin), padding.left, bounds.height - 12);
        distributionContext.textAlign = 'center';
        distributionContext.fillText(formatInteger((xMin + xMax) / 2), padding.left + (plotWidth / 2), bounds.height - 12);
        distributionContext.textAlign = 'right';
        distributionContext.fillText(formatInteger(xMax), padding.left + plotWidth, bounds.height - 12);
        distributionContext.textAlign = 'left';
        distributionContext.fillStyle = '#fed7aa';
        distributionContext.fillText('Target', Math.min(bounds.width - 54, targetX + 8), padding.top + 14);
        distributionContext.fillStyle = 'rgba(255, 255, 255, 0.82)';
        distributionContext.fillText('Mean', Math.min(bounds.width - 44, meanX + 8), padding.top + 32);
        distributionContext.fillStyle = '#7dd3fc';
        distributionContext.fillText('Median', Math.min(bounds.width - 50, medianX + 8), padding.top + 50);
        distributionContext.restore();
    }

    function updateStatsAndCopy() {
        if (!state.results) {
            return;
        }

        var stats = state.results.stats;
        statTargets.successRate.textContent = (stats.successRate * 100).toFixed(1) + '%';
        statTargets.meanFinish.textContent = formatInteger(stats.meanFinish);
        statTargets.medianFinish.textContent = formatInteger(stats.medianFinish);
        statTargets.rangeBand.textContent = formatInteger(stats.lowBand) + ' - ' + formatInteger(stats.highBand);

        histogramSummary.textContent = 'Hurdle ' + formatInteger(state.results.settings.target) + ' | ' + formatInteger(state.results.settings.simulations) + ' scenarios';

        if (stats.successRate >= 0.66) {
            notePanel.textContent = 'The review story is favorable: most scenarios clear the hurdle, so the conversation shifts from survival to sizing and timing.';
        } else if (stats.successRate >= 0.38) {
            notePanel.textContent = 'This is the tension zone: the plan is still viable, but enough scenarios miss that leadership should debate buffers, sequencing, and exposure.';
        } else {
            notePanel.textContent = 'This reads like a red-flag review. The hurdle is fighting the distribution, so the plan likely needs more than cosmetic optimism.';
        }
    }

    function updateLivePill(progressStep, isComplete) {
        if (!state.results) {
            return;
        }

        if (isComplete) {
            livePill.textContent = 'Scenario set complete | ' + formatInteger(state.results.settings.simulations) + ' cases';
            return;
        }

        livePill.textContent = 'Review step ' + progressStep + ' / ' + state.results.settings.horizon + ' | ' + formatInteger(state.results.settings.simulations) + ' scenarios';
    }

    function cancelAnimation() {
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
        state.animationStartTime = null;
    }

    function renderCurrentState() {
        if (!state.results) {
            return;
        }

        drawPathChart(state.progressStep);
        drawDistributionChart();
        updateLivePill(state.progressStep, state.progressStep >= state.results.settings.horizon);
    }

    function animateSimulation(timestamp) {
        if (!state.results) {
            return;
        }

        if (!state.animationStartTime) {
            state.animationStartTime = timestamp;
        }

        var elapsed = timestamp - state.animationStartTime;
        var duration = Math.max(1800, Math.min(3600, state.results.settings.horizon * 26));
        var progress = Math.min(1, elapsed / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        var nextStep = Math.min(state.results.settings.horizon, Math.floor(eased * state.results.settings.horizon));

        if (nextStep !== state.progressStep) {
            state.progressStep = nextStep;
            drawPathChart(state.progressStep);
            updateLivePill(state.progressStep, false);
        }

        if (progress < 1) {
            state.animationFrameId = requestAnimationFrame(animateSimulation);
        } else {
            state.progressStep = state.results.settings.horizon;
            state.animationFrameId = null;
            state.animationStartTime = null;
            drawPathChart(state.progressStep);
            updateLivePill(state.progressStep, true);
        }
    }

    function runSimulation() {
        cancelAnimation();
        updateControlOutputs();
        state.results = summarizeSimulation(readSettings());
        state.progressStep = 0;
        resizeCanvases();
        updateStatsAndCopy();
        drawDistributionChart();
        drawPathChart(0);
        updateLivePill(0, false);
        state.animationFrameId = requestAnimationFrame(animateSimulation);
    }

    function redrawAfterResize() {
        clearTimeout(state.resizeTimer);
        state.resizeTimer = setTimeout(function () {
            resizeCanvases();
            renderCurrentState();
        }, 80);
    }

    controlIds.forEach(function (key) {
        controls[key].addEventListener('input', function () {
            updateControlOutputs();
            if (state.currentPreset !== 'custom') {
                markCustomScenario();
            }
        });
    });

    presetButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            applyPreset(button.getAttribute('data-preset'), true);
        });
    });

    runButton.addEventListener('click', function () {
        runSimulation();
    });

    remixButton.addEventListener('click', function () {
        runSimulation();
    });

    window.addEventListener('resize', redrawAfterResize);

    if (window.jQuery) {
        window.jQuery('#myTab a[href="#fun"]').on('shown.bs.tab', function () {
            setTimeout(function () {
                resizeCanvases();
                renderCurrentState();
            }, 80);
        });
    }

    window.redrawMonteCarloLab = function () {
        resizeCanvases();
        renderCurrentState();
    };

    applyPreset('steady', false);
    runSimulation();

    var funPane = document.getElementById('fun');
    if (funPane && funPane.classList.contains('active')) {
        setTimeout(function () {
            resizeCanvases();
            renderCurrentState();
        }, 80);
    }
});
