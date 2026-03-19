document.addEventListener('DOMContentLoaded', function () {
    initABTestSimulator();
    initLLMCostSimulator();
});

function initABTestSimulator() {
    var root = document.getElementById('ab-test-simulator');
    if (!root) {
        return;
    }

    var canvas = document.getElementById('ab-power-canvas');
    if (!canvas || !canvas.getContext) {
        return;
    }

    var context = canvas.getContext('2d');
    var scenario = document.getElementById('ab-sim-scenario');
    var stagePill = document.getElementById('ab-stage-pill');
    var runtimePill = document.getElementById('ab-runtime-pill');
    var runtimeFill = document.getElementById('ab-runtime-fill');
    var runtimeCopy = document.getElementById('ab-runtime-copy');
    var notePanel = document.getElementById('ab-note-panel');
    var presetButtons = Array.prototype.slice.call(root.querySelectorAll('[data-ab-preset]'));

    var controls = {
        baseline: document.getElementById('ab-baseline'),
        uplift: document.getElementById('ab-uplift'),
        sampleSize: document.getElementById('ab-sample-size'),
        variance: document.getElementById('ab-variance'),
        dailyTraffic: document.getElementById('ab-daily-traffic')
    };

    var outputs = {
        baseline: document.getElementById('ab-baseline-value'),
        uplift: document.getElementById('ab-uplift-value'),
        sampleSize: document.getElementById('ab-sample-size-value'),
        variance: document.getElementById('ab-variance-value'),
        dailyTraffic: document.getElementById('ab-daily-traffic-value')
    };

    var stats = {
        power: document.getElementById('ab-power-stat'),
        falsePositive: document.getElementById('ab-false-positive-stat'),
        falseNegative: document.getElementById('ab-false-negative-stat'),
        runtime: document.getElementById('ab-runtime-stat')
    };

    var PRESETS = {
        cta: {
            baseline: 8,
            uplift: 8,
            sampleSize: 18000,
            variance: 1,
            dailyTraffic: 6000,
            blurb: 'Homepage CTA changes often look exciting quickly, but they are exactly the kind of experiment where novelty can fake confidence.'
        },
        pricing: {
            baseline: 3.5,
            uplift: 12,
            sampleSize: 42000,
            variance: 1.2,
            dailyTraffic: 11000,
            blurb: 'Pricing page tests usually have lower baseline conversion and higher business stakes, so the sample appetite climbs fast.'
        },
        checkout: {
            baseline: 11,
            uplift: 4,
            sampleSize: 70000,
            variance: 1.45,
            dailyTraffic: 18000,
            blurb: 'Checkout experiments live in a noisy environment with many confounders, which means even a real gain can hide inside variance.'
        }
    };

    var state = {
        currentPreset: 'cta',
        resizeTimer: null,
        result: null
    };

    function formatNumber(value) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(Math.round(value));
    }

    function formatPercent(value, digits, showPlus) {
        var prefix = showPlus && value > 0 ? '+' : '';
        return prefix + value.toFixed(digits) + '%';
    }

    function formatDays(value) {
        if (value >= 14) {
            return (value / 7).toFixed(1) + ' wk';
        }
        return value.toFixed(1) + ' d';
    }

    function setCanvasSize() {
        var parent = canvas.parentElement;
        var styles = window.getComputedStyle(parent);
        var width = Math.max(320, parent.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0));
        var height = Math.max(250, Math.round(width * 0.48));
        var ratio = window.devicePixelRatio || 1;

        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function normalCdf(x) {
        var sign = x < 0 ? -1 : 1;
        var absolute = Math.abs(x) / Math.sqrt(2);
        var t = 1 / (1 + 0.3275911 * absolute);
        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absolute * absolute);

        return 0.5 * (1 + sign * erf);
    }

    function normalPdf(x, mean, sd) {
        var safeSd = Math.max(sd, 0.0001);
        var exponent = -0.5 * Math.pow((x - mean) / safeSd, 2);
        return (1 / (safeSd * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    }

    function setPresetState(activeKey) {
        presetButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-ab-preset') === activeKey);
        });
    }

    function updateOutputs() {
        outputs.baseline.textContent = formatPercent(parseFloat(controls.baseline.value), 1, false);
        outputs.uplift.textContent = formatPercent(parseFloat(controls.uplift.value), 1, true);
        outputs.sampleSize.textContent = formatNumber(parseFloat(controls.sampleSize.value));
        outputs.variance.textContent = parseFloat(controls.variance.value).toFixed(2) + 'x';
        outputs.dailyTraffic.textContent = formatNumber(parseFloat(controls.dailyTraffic.value));
    }

    function applyPreset(name) {
        var preset = PRESETS[name];
        if (!preset) {
            return;
        }

        state.currentPreset = name;
        controls.baseline.value = preset.baseline;
        controls.uplift.value = preset.uplift;
        controls.sampleSize.value = preset.sampleSize;
        controls.variance.value = preset.variance;
        controls.dailyTraffic.value = preset.dailyTraffic;
        scenario.textContent = preset.blurb;
        setPresetState(name);
        updateOutputs();
        render();
    }

    function markCustom() {
        if (state.currentPreset === 'custom') {
            return;
        }

        state.currentPreset = 'custom';
        setPresetState('__none__');
        scenario.textContent = 'Custom setup: drag the levers until the tradeoff feels like your actual launch meeting, then see if the evidence still holds.';
    }

    function calculateABResult() {
        var alpha = 0.05;
        var zAlpha = 1.959963984540054;
        var baselinePercent = parseFloat(controls.baseline.value);
        var upliftPercent = parseFloat(controls.uplift.value);
        var sampleSize = parseFloat(controls.sampleSize.value);
        var varianceMultiplier = parseFloat(controls.variance.value);
        var dailyTraffic = parseFloat(controls.dailyTraffic.value);
        var p1 = baselinePercent / 100;
        var p2 = Math.min(0.95, p1 * (1 + upliftPercent / 100));
        var effect = p2 - p1;
        var pooled = (p1 + p2) / 2;
        var seNull = Math.sqrt(varianceMultiplier * ((2 * pooled * (1 - pooled)) / sampleSize));
        var seAlt = Math.sqrt(varianceMultiplier * ((p1 * (1 - p1) + p2 * (1 - p2)) / sampleSize));
        var critical = zAlpha * seNull;
        var power = 1 - normalCdf((critical - effect) / seAlt) + normalCdf((-critical - effect) / seAlt);
        var runtimeDays = (sampleSize * 2) / Math.max(dailyTraffic, 1);
        var missRisk = Math.max(0, 1 - power);
        var peekPenalty = runtimeDays < 7 ? 1 + ((7 - runtimeDays) / 8) : 1;
        var falsePositive = Math.min(0.22, alpha * varianceMultiplier * peekPenalty);

        return {
            power: Math.min(0.999, Math.max(0.001, power)),
            falsePositive: falsePositive,
            missRisk: missRisk,
            runtimeDays: runtimeDays,
            effectPoints: effect * 100,
            criticalPoints: critical * 100,
            seNullPoints: seNull * 100,
            seAltPoints: seAlt * 100
        };
    }

    function updateABNarrative(result) {
        stats.power.textContent = formatPercent(result.power * 100, 0, false);
        stats.falsePositive.textContent = formatPercent(result.falsePositive * 100, 1, false);
        stats.falseNegative.textContent = formatPercent(result.missRisk * 100, 0, false);
        stats.runtime.textContent = formatDays(result.runtimeDays);
        runtimePill.textContent = '~' + formatDays(result.runtimeDays);
        runtimeFill.style.width = Math.min(100, Math.max(8, (result.runtimeDays / 28) * 100)) + '%';

        if (result.power >= 0.8 && result.runtimeDays <= 21) {
            stagePill.textContent = 'Decision-grade read';
            runtimeCopy.textContent = 'This setup has enough traffic and signal to get to a trustworthy answer without dragging for too long.';
            notePanel.textContent = 'This is the kind of setup that supports a real ship / no-ship decision. You still need clean instrumentation, but the math is not fighting you.';
        } else if (result.power >= 0.65) {
            stagePill.textContent = 'Borderline evidence';
            runtimeCopy.textContent = 'You can probably learn something here, but a skeptical reviewer will still ask whether you are under-reading the tail risk.';
            notePanel.textContent = 'The design is usable but tense: enough evidence to form a view, not always enough to close the argument. More sample or less variance would help.';
        } else {
            stagePill.textContent = 'Underpowered setup';
            runtimeCopy.textContent = 'Right now the experiment is faster than it is trustworthy. A lucky spike could look like insight before the sample matures.';
            notePanel.textContent = 'This design is likely to miss a real lift or overreact to noise. Before shipping the treatment, increase sample, reduce noise, or narrow the decision scope.';
        }
    }

    function drawABCanvas(result) {
        var width = parseFloat(canvas.style.width) || 600;
        var height = parseFloat(canvas.style.height) || 280;
        var padding = { top: 22, right: 18, bottom: 40, left: 52 };
        var plotWidth = width - padding.left - padding.right;
        var plotHeight = height - padding.top - padding.bottom;
        var xMin = Math.min(-result.criticalPoints * 2.2, result.effectPoints - result.criticalPoints * 2.2);
        var xMax = Math.max(result.criticalPoints * 2.2, result.effectPoints + result.criticalPoints * 2.2);
        var maxPdf = Math.max(
            normalPdf(0, 0, result.seNullPoints),
            normalPdf(result.effectPoints, result.effectPoints, result.seAltPoints)
        );

        function xToCanvas(x) {
            return padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
        }

        function yToCanvas(y) {
            return padding.top + plotHeight - ((y / (maxPdf * 1.25)) * plotHeight);
        }

        context.clearRect(0, 0, width, height);

        var background = context.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#f8fafc');
        background.addColorStop(1, '#ecfeff');
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);

        context.save();
        context.fillStyle = 'rgba(251, 146, 60, 0.08)';
        context.fillRect(xToCanvas(result.criticalPoints), padding.top, width - xToCanvas(result.criticalPoints) - padding.right, plotHeight);
        context.fillRect(padding.left, padding.top, xToCanvas(-result.criticalPoints) - padding.left, plotHeight);
        context.restore();

        context.save();
        context.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        context.lineWidth = 1;
        context.font = '12px Hind, sans-serif';
        context.fillStyle = '#64748b';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        for (var column = 0; column <= 4; column += 1) {
            var xValue = xMin + ((xMax - xMin) / 4) * column;
            var x = xToCanvas(xValue);
            context.beginPath();
            context.moveTo(x, padding.top);
            context.lineTo(x, padding.top + plotHeight);
            context.stroke();
            context.fillText(formatPercent(xValue, 1, false), x, padding.top + plotHeight + 10);
        }

        for (var row = 0; row <= 3; row += 1) {
            var y = padding.top + plotHeight * (row / 3);
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(padding.left + plotWidth, y);
            context.stroke();
        }

        context.restore();

        function drawCurve(mean, sd, stroke, fill) {
            context.save();
            context.beginPath();
            context.moveTo(xToCanvas(xMin), yToCanvas(0));
            for (var step = 0; step <= 220; step += 1) {
                var value = xMin + ((xMax - xMin) / 220) * step;
                context.lineTo(xToCanvas(value), yToCanvas(normalPdf(value, mean, sd)));
            }
            context.lineTo(xToCanvas(xMax), yToCanvas(0));
            context.closePath();
            context.fillStyle = fill;
            context.fill();
            context.restore();

            context.save();
            context.beginPath();
            for (var trace = 0; trace <= 220; trace += 1) {
                var traceValue = xMin + ((xMax - xMin) / 220) * trace;
                var tracePdf = normalPdf(traceValue, mean, sd);
                if (trace === 0) {
                    context.moveTo(xToCanvas(traceValue), yToCanvas(tracePdf));
                } else {
                    context.lineTo(xToCanvas(traceValue), yToCanvas(tracePdf));
                }
            }
            context.strokeStyle = stroke;
            context.lineWidth = 2.2;
            context.stroke();
            context.restore();
        }

        drawCurve(0, result.seNullPoints, '#f97316', 'rgba(249, 115, 22, 0.14)');
        drawCurve(result.effectPoints, result.seAltPoints, '#0ea5e9', 'rgba(14, 165, 233, 0.12)');

        context.save();
        context.setLineDash([7, 7]);
        context.strokeStyle = '#f97316';
        context.beginPath();
        context.moveTo(xToCanvas(-result.criticalPoints), padding.top);
        context.lineTo(xToCanvas(-result.criticalPoints), padding.top + plotHeight);
        context.moveTo(xToCanvas(result.criticalPoints), padding.top);
        context.lineTo(xToCanvas(result.criticalPoints), padding.top + plotHeight);
        context.stroke();
        context.restore();

        context.save();
        context.strokeStyle = '#0ea5e9';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(xToCanvas(result.effectPoints), padding.top);
        context.lineTo(xToCanvas(result.effectPoints), padding.top + plotHeight);
        context.stroke();
        context.restore();

        context.save();
        context.fillStyle = '#0f172a';
        context.font = '600 12px Hind, sans-serif';
        context.textAlign = 'left';
        context.fillText('Null', padding.left + 8, padding.top + 8);
        context.fillStyle = '#0ea5e9';
        context.fillText('Expected uplift', padding.left + 8, padding.top + 26);
        context.fillStyle = '#f97316';
        context.fillText('Reject if observed lift is beyond +/- ' + formatPercent(result.criticalPoints, 2, false), padding.left + 8, padding.top + 44);
        context.restore();
    }

    function render() {
        state.result = calculateABResult();
        updateABNarrative(state.result);
        setCanvasSize();
        drawABCanvas(state.result);
    }

    Object.keys(controls).forEach(function (key) {
        controls[key].addEventListener('input', function () {
            updateOutputs();
            markCustom();
            render();
        });
    });

    presetButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            applyPreset(button.getAttribute('data-ab-preset'));
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

    applyPreset('cta');
}

function initLLMCostSimulator() {
    var root = document.getElementById('llm-cost-simulator');
    if (!root) {
        return;
    }

    var costCanvas = document.getElementById('llm-cost-canvas');
    var latencyCanvas = document.getElementById('llm-latency-canvas');
    if (!costCanvas || !latencyCanvas || !costCanvas.getContext || !latencyCanvas.getContext) {
        return;
    }

    var costContext = costCanvas.getContext('2d');
    var latencyContext = latencyCanvas.getContext('2d');
    var scenario = document.getElementById('llm-sim-scenario');
    var costPill = document.getElementById('llm-cost-pill');
    var latencyPill = document.getElementById('llm-latency-pill');
    var notePanel = document.getElementById('llm-note-panel');
    var presetButtons = Array.prototype.slice.call(root.querySelectorAll('[data-llm-preset]'));
    var modelButtons = Array.prototype.slice.call(root.querySelectorAll('[data-llm-model]'));

    var controls = {
        qps: document.getElementById('llm-qps'),
        context: document.getElementById('llm-context'),
        output: document.getElementById('llm-output'),
        cacheHit: document.getElementById('llm-cache-hit'),
        retryRate: document.getElementById('llm-retry-rate')
    };

    var outputs = {
        qps: document.getElementById('llm-qps-value'),
        context: document.getElementById('llm-context-value'),
        output: document.getElementById('llm-output-value'),
        cacheHit: document.getElementById('llm-cache-hit-value'),
        retryRate: document.getElementById('llm-retry-rate-value')
    };

    var stats = {
        monthlyCost: document.getElementById('llm-monthly-cost-stat'),
        p95Latency: document.getElementById('llm-p95-latency-stat'),
        failureRate: document.getElementById('llm-failure-rate-stat'),
        cacheSavings: document.getElementById('llm-cache-savings-stat')
    };

    var MODEL_PROFILES = {
        fast: {
            inputCost: 0.4,
            outputCost: 1.6,
            cachedFactor: 0.2,
            baseLatency: 420,
            inputMsPer1k: 2.1,
            outputMsPer1k: 13,
            capacityQps: 18,
            baseFailure: 0.004,
            latencyCacheRelief: 0.72
        },
        balanced: {
            inputCost: 1.3,
            outputCost: 4.8,
            cachedFactor: 0.18,
            baseLatency: 880,
            inputMsPer1k: 3.2,
            outputMsPer1k: 20,
            capacityQps: 8,
            baseFailure: 0.008,
            latencyCacheRelief: 0.68
        },
        reasoning: {
            inputCost: 3.9,
            outputCost: 13.8,
            cachedFactor: 0.15,
            baseLatency: 1680,
            inputMsPer1k: 5.4,
            outputMsPer1k: 31,
            capacityQps: 3.2,
            baseFailure: 0.013,
            latencyCacheRelief: 0.58
        }
    };

    var PRESETS = {
        support: {
            model: 'fast',
            qps: 1.2,
            context: 7000,
            output: 900,
            cacheHit: 35,
            retryRate: 6,
            blurb: 'Support copilots look cheap until context balloons and retries pile up during busy hours.'
        },
        agent: {
            model: 'balanced',
            qps: 2.8,
            context: 12000,
            output: 1300,
            cacheHit: 42,
            retryRate: 8,
            blurb: 'Workflow agents usually feel healthy in dev, then discover in prod that orchestration retries quietly double the economics.'
        },
        research: {
            model: 'reasoning',
            qps: 0.5,
            context: 26000,
            output: 2200,
            cacheHit: 18,
            retryRate: 11,
            blurb: 'Research-style assistants trade speed for depth, which means queueing and cost can spike long before product demand looks huge.'
        }
    };

    var state = {
        currentPreset: 'support',
        currentModel: 'fast',
        resizeTimer: null,
        result: null
    };

    function formatNumber(value) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(Math.round(value));
    }

    function formatCurrencyCompact(value) {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(2) + 'M';
        }
        if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'k';
        }
        return '$' + value.toFixed(0);
    }

    function formatLatency(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(2) + 's';
        }
        return Math.round(value) + 'ms';
    }

    function formatPercent(value, digits) {
        return value.toFixed(digits) + '%';
    }

    function formatRequestVolume(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M/mo';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k/mo';
        }
        return Math.round(value) + '/mo';
    }

    function setCanvasSize(canvas, context) {
        var parent = canvas.parentElement;
        var styles = window.getComputedStyle(parent);
        var width = Math.max(320, parent.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0));
        var height = Math.max(240, Math.round(width * 0.42));
        var ratio = window.devicePixelRatio || 1;

        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function updateOutputs() {
        outputs.qps.textContent = parseFloat(controls.qps.value).toFixed(1);
        outputs.context.textContent = formatNumber(parseFloat(controls.context.value));
        outputs.output.textContent = formatNumber(parseFloat(controls.output.value));
        outputs.cacheHit.textContent = formatPercent(parseFloat(controls.cacheHit.value), 0);
        outputs.retryRate.textContent = formatPercent(parseFloat(controls.retryRate.value), 0);
    }

    function setPresetState(activeKey) {
        presetButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-llm-preset') === activeKey);
        });
    }

    function setModelState(activeKey) {
        modelButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-llm-model') === activeKey);
        });
    }

    function applyPreset(name) {
        var preset = PRESETS[name];
        if (!preset) {
            return;
        }

        state.currentPreset = name;
        state.currentModel = preset.model;
        controls.qps.value = preset.qps;
        controls.context.value = preset.context;
        controls.output.value = preset.output;
        controls.cacheHit.value = preset.cacheHit;
        controls.retryRate.value = preset.retryRate;
        scenario.textContent = preset.blurb;
        setPresetState(name);
        setModelState(preset.model);
        updateOutputs();
        render();
    }

    function markCustomPreset() {
        if (state.currentPreset === 'custom') {
            return;
        }

        state.currentPreset = 'custom';
        setPresetState('__none__');
        scenario.textContent = 'Custom workload: treat this as a what-if board for your actual traffic, prompt shape, and retry reality instead of a canned demo.';
    }

    function calculateLLMResult() {
        var profile = MODEL_PROFILES[state.currentModel];
        var monthlyRequests = parseFloat(controls.qps.value) * 30 * 24 * 60 * 60;
        var contextTokens = parseFloat(controls.context.value);
        var outputTokens = parseFloat(controls.output.value);
        var cacheHit = parseFloat(controls.cacheHit.value) / 100;
        var retryShare = parseFloat(controls.retryRate.value) / 100;
        var uncachedInputCost = monthlyRequests * contextTokens * (1 - cacheHit) * profile.inputCost / 1000000;
        var cachedInputCost = monthlyRequests * contextTokens * cacheHit * profile.inputCost * profile.cachedFactor / 1000000;
        var outputCost = monthlyRequests * outputTokens * profile.outputCost / 1000000;
        var retryBaseCost = (contextTokens * (((1 - cacheHit) * profile.inputCost) + (cacheHit * profile.inputCost * profile.cachedFactor)) + (outputTokens * profile.outputCost)) / 1000000;
        var retryCost = monthlyRequests * retryShare * retryBaseCost;
        var totalCost = uncachedInputCost + cachedInputCost + outputCost + retryCost;
        var cacheSavings = monthlyRequests * contextTokens * cacheHit * profile.inputCost * (1 - profile.cachedFactor) / 1000000;
        var saturation = parseFloat(controls.qps.value) / profile.capacityQps;
        var promptMs = (contextTokens * (1 - cacheHit * profile.latencyCacheRelief) / 1000) * profile.inputMsPer1k;
        var generationMs = (outputTokens / 1000) * profile.outputMsPer1k;
        var queueMs = saturation <= 0.55 ? 0 : 180 * Math.pow((saturation - 0.55) * 2.2, 2);
        var retryTailMs = retryShare * (profile.baseLatency * 0.6 + generationMs * 0.55 + queueMs * 0.8);
        var p95Latency = profile.baseLatency + promptMs + generationMs + queueMs + retryTailMs;
        var hardFailure = profile.baseFailure + Math.max(0, saturation - 0.75) * 0.06;
        var visibleFailure = Math.min(0.38, hardFailure + retryShare * (0.12 + Math.max(0, saturation - 0.8) * 0.35));

        return {
            monthlyRequests: monthlyRequests,
            totalCost: totalCost,
            cacheSavings: cacheSavings,
            p95Latency: p95Latency,
            visibleFailure: visibleFailure,
            saturation: saturation,
            costParts: [
                { label: 'Uncached input', value: uncachedInputCost, color: '#38bdf8' },
                { label: 'Cached input', value: cachedInputCost, color: '#22c55e' },
                { label: 'Output', value: outputCost, color: '#f59e0b' },
                { label: 'Retries', value: retryCost, color: '#f97316' }
            ],
            latencyParts: [
                { label: 'Base', value: profile.baseLatency, color: '#38bdf8' },
                { label: 'Prompt', value: promptMs, color: '#14b8a6' },
                { label: 'Generation', value: generationMs, color: '#f59e0b' },
                { label: 'Queue', value: queueMs, color: '#ef4444' },
                { label: 'Retry tail', value: retryTailMs, color: '#a855f7' }
            ]
        };
    }

    function updateLLMNarrative(result) {
        stats.monthlyCost.textContent = formatCurrencyCompact(result.totalCost);
        stats.p95Latency.textContent = formatLatency(result.p95Latency);
        stats.failureRate.textContent = formatPercent(result.visibleFailure * 100, 1);
        stats.cacheSavings.textContent = formatCurrencyCompact(result.cacheSavings);
        costPill.textContent = formatRequestVolume(result.monthlyRequests);

        if (result.saturation < 0.65 && result.p95Latency < 1800) {
            latencyPill.textContent = 'Healthy headroom';
            notePanel.textContent = 'This workload still has breathing room. Cache savings are real, and the current latency budget is not yet dominated by queueing.';
        } else if (result.saturation < 1) {
            latencyPill.textContent = 'Tight operating band';
            notePanel.textContent = 'The system is still shippable, but retries and queueing are becoming part of the economics. This is where architecture choices start to matter more than prompt tuning.';
        } else {
            latencyPill.textContent = 'Queueing dominates';
            notePanel.textContent = 'The workflow is above its comfortable throughput envelope. At this point, more traffic mostly buys more retries, more wait time, and more budget pressure.';
        }
    }

    function drawCostCanvas(result) {
        var width = parseFloat(costCanvas.style.width) || 600;
        var height = parseFloat(costCanvas.style.height) || 260;
        var padding = { top: 30, right: 24, bottom: 50, left: 24 };
        var barWidth = width - padding.left - padding.right;
        var barY = padding.top + 34;
        var barHeight = 28;
        var total = result.totalCost || 1;
        var cursor = padding.left;

        costContext.clearRect(0, 0, width, height);
        var background = costContext.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#0b1220');
        background.addColorStop(1, '#05080f');
        costContext.fillStyle = background;
        costContext.fillRect(0, 0, width, height);

        costContext.fillStyle = 'rgba(148, 163, 184, 0.12)';
        costContext.fillRect(padding.left, barY, barWidth, barHeight);

        result.costParts.forEach(function (part) {
            var segmentWidth = (part.value / total) * barWidth;
            costContext.fillStyle = part.color;
            costContext.fillRect(cursor, barY, segmentWidth, barHeight);
            cursor += segmentWidth;
        });

        costContext.strokeStyle = 'rgba(148, 163, 184, 0.18)';
        costContext.strokeRect(padding.left, barY, barWidth, barHeight);
        costContext.fillStyle = '#f8fafc';
        costContext.font = '700 13px Hind, sans-serif';
        costContext.fillText('Actual monthly spend mix', padding.left, padding.top);
        costContext.fillStyle = '#5eead4';
        costContext.fillText('Cache saves about ' + formatCurrencyCompact(result.cacheSavings), padding.left, padding.top + 18);

        result.costParts.forEach(function (part, index) {
            var y = barY + 58 + index * 30;
            costContext.fillStyle = part.color;
            costContext.fillRect(padding.left, y, 12, 12);
            costContext.fillStyle = '#dbeafe';
            costContext.font = '12px Hind, sans-serif';
            costContext.fillText(part.label + '  ' + formatCurrencyCompact(part.value), padding.left + 20, y + 11);
        });
    }

    function drawLatencyCanvas(result) {
        var width = parseFloat(latencyCanvas.style.width) || 600;
        var height = parseFloat(latencyCanvas.style.height) || 260;
        var padding = { top: 28, right: 24, bottom: 54, left: 24 };
        var barWidth = width - padding.left - padding.right;
        var barY = padding.top + 34;
        var barHeight = 26;
        var totalLatency = result.p95Latency || 1;
        var cursor = padding.left;

        latencyContext.clearRect(0, 0, width, height);
        latencyContext.fillStyle = '#08111c';
        latencyContext.fillRect(0, 0, width, height);
        latencyContext.fillStyle = 'rgba(148, 163, 184, 0.1)';
        latencyContext.fillRect(padding.left, barY, barWidth, barHeight);

        result.latencyParts.forEach(function (part) {
            if (part.value <= 0) {
                return;
            }
            var segmentWidth = (part.value / totalLatency) * barWidth;
            latencyContext.fillStyle = part.color;
            latencyContext.fillRect(cursor, barY, segmentWidth, barHeight);
            cursor += segmentWidth;
        });

        var gaugeWidth = Math.max(40, Math.min(barWidth, barWidth * Math.min(1.35, result.saturation)));
        latencyContext.strokeStyle = 'rgba(94, 234, 212, 0.3)';
        latencyContext.lineWidth = 2;
        latencyContext.strokeRect(padding.left, barY + 82, barWidth, 16);
        latencyContext.fillStyle = result.saturation < 0.65 ? '#14b8a6' : (result.saturation < 1 ? '#f59e0b' : '#ef4444');
        latencyContext.fillRect(padding.left, barY + 82, Math.min(barWidth, gaugeWidth), 16);
        latencyContext.fillStyle = '#f8fafc';
        latencyContext.font = '700 13px Hind, sans-serif';
        latencyContext.fillText('P95 latency budget', padding.left, padding.top);
        latencyContext.fillStyle = '#cbd5e1';
        latencyContext.fillText('Throughput load vs. model comfort zone', padding.left, barY + 74);
        latencyContext.fillText('Load factor: ' + result.saturation.toFixed(2) + 'x', padding.left + barWidth - 92, barY + 74);

        result.latencyParts.forEach(function (part, index) {
            var y = barY + 116 + index * 24;
            latencyContext.fillStyle = part.color;
            latencyContext.fillRect(padding.left, y, 11, 11);
            latencyContext.fillStyle = '#dbeafe';
            latencyContext.font = '12px Hind, sans-serif';
            latencyContext.fillText(part.label + '  ' + formatLatency(part.value), padding.left + 18, y + 10);
        });
    }

    function render() {
        state.result = calculateLLMResult();
        updateLLMNarrative(state.result);
        setCanvasSize(costCanvas, costContext);
        setCanvasSize(latencyCanvas, latencyContext);
        drawCostCanvas(state.result);
        drawLatencyCanvas(state.result);
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
            applyPreset(button.getAttribute('data-llm-preset'));
        });
    });

    modelButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            state.currentModel = button.getAttribute('data-llm-model');
            setModelState(state.currentModel);
            markCustomPreset();
            render();
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

    applyPreset('support');
}
