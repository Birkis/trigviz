import type { AngleUnit } from '$lib/math/angles';
import { DEFAULT_TAN_EPSILON, safeTan } from '$lib/math/trig';
import { advancePhase, createRafLoop, createScheduledFrame, scrubPhase } from '$lib/sim/animation';
import { horizontalConnectorPath, toOverlayPoint } from '$lib/sim/connector';
import {
	createCurveSampler,
	getSampledPaths,
	resetAndSample,
	sampleToPhase,
	type SamplerFlags
} from '$lib/sim/curveSampler';
import {
	createCircleGeometry,
	createPlotGeometry,
	createTailGeometry
} from '$lib/sim/plotGeometry';
import { buildRingPath } from '$lib/sim/ringBuffer';
import {
	DEFAULT_VIZ_URL_STATE,
	parseVizSearchParams,
	replaceUrlSearch,
	serializeVizSearchParams,
	type VizUrlState
} from '$lib/sim/urlState';

export class Visualizer {
	running = $state(true);
	speed = $state(1.6);
	phase = $state(0);
	turns = $state(0);
	unit = $state<AngleUnit>('rad');

	showSin = $state(true);
	showCos = $state(true);
	showTan = $state(true);
	tanClamp = $state(3);
	showTanConstruction = $state(false);

	sinPath = $state('');
	cosPath = $state('');
	tanPath = $state('');
	tailPath = $state('');
	connectorPath = $state('');

	circleSvg = $state<SVGSVGElement | null>(null);
	curvesSvg = $state<SVGSVGElement | null>(null);
	overlaySvg = $state<SVGSVGElement | null>(null);
	overlayWidth = $state(0);
	overlayHeight = $state(0);
	visualizationEl = $state<HTMLDivElement | null>(null);

	readonly plotGeometry = createPlotGeometry();
	readonly circleGeometry = createCircleGeometry();
	readonly tailGeometry = createTailGeometry();

	readonly cosv = $derived(Math.cos(this.phase));
	readonly sinv = $derived(Math.sin(this.phase));
	readonly tanv = $derived(safeTan(this.phase, this.tanClamp, DEFAULT_TAN_EPSILON));

	#sampler = createCurveSampler(this.tailGeometry.tailMax);
	#rafLoop = createRafLoop();
	#connectorFrame = createScheduledFrame();
	#urlTimer = 0;
	#suppressUrl = false;

	flags(): SamplerFlags {
		return {
			showSin: this.showSin,
			showCos: this.showCos,
			showTan: this.showTan
		};
	}

	publishPaths() {
		const paths = getSampledPaths(this.#sampler);
		this.sinPath = paths.sinPath;
		this.cosPath = paths.cosPath;
		this.tanPath = paths.tanPath;
		this.tailPath = buildRingPath(this.#sampler.tail, (value, i, count) => {
			const innerW = this.tailGeometry.tailW - this.tailGeometry.tailPad * 2;
			return {
				x: this.tailGeometry.tailPad + (i / Math.max(1, count - 1)) * innerW,
				y: this.tailGeometry.tailMid - value * this.tailGeometry.tailAmp
			};
		});
	}

	scheduleConnectorUpdate() {
		this.#connectorFrame.schedule(() => this.updateConnector());
	}

	rebuildFromPhase(targetPhase: number) {
		resetAndSample(this.#sampler, this.plotGeometry, targetPhase, this.flags(), this.tanClamp);
		this.publishPaths();
		this.scheduleConnectorUpdate();
	}

	setPhaseAndRebuild(value: number, { pause = false } = {}) {
		if (pause) this.running = false;
		this.phase = scrubPhase(value);
		this.rebuildFromPhase(this.phase);
		this.queueUrlSync();
	}

	updateFlagsAndRebuild(update: () => void) {
		update();
		this.rebuildFromPhase(this.phase);
		this.queueUrlSync();
	}

	updateOverlaySize() {
		if (!this.visualizationEl) return;
		const rect = this.visualizationEl.getBoundingClientRect();
		this.overlayWidth = rect.width;
		this.overlayHeight = rect.height;
	}

	updateConnector() {
		if (!this.overlaySvg || !this.showSin) {
			this.connectorPath = '';
			return;
		}

		const startLocal = {
			x: this.circleGeometry.cx + this.circleGeometry.r * this.cosv,
			y: this.circleGeometry.cy - this.circleGeometry.r * this.sinv
		};
		const endLocal = {
			x: this.plotGeometry.xFromPhase(this.phase),
			y: this.plotGeometry.yFromValue(this.sinv)
		};

		const start = toOverlayPoint(this.circleSvg, this.overlaySvg, startLocal);
		const end = toOverlayPoint(this.curvesSvg, this.overlaySvg, endLocal);

		if (!start || !end) {
			this.connectorPath = '';
			return;
		}

		this.connectorPath = horizontalConnectorPath(start, end);
	}

	mount() {
		this.hydrateFromLocation();

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			this.running = false;
		}

		const resizeObserver =
			typeof ResizeObserver !== 'undefined'
				? new ResizeObserver(() => {
						this.updateOverlaySize();
						this.scheduleConnectorUpdate();
					})
				: null;

		if (this.visualizationEl && resizeObserver) {
			resizeObserver.observe(this.visualizationEl);
		}

		const handleResize = () => {
			this.updateOverlaySize();
			this.scheduleConnectorUpdate();
		};
		const handleScroll = () => this.scheduleConnectorUpdate();
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll, true);

		this.#rafLoop.start((dt) => {
			if (!this.running) return;

			const advanced = advancePhase(this.phase, this.speed, dt);
			this.turns += advanced.turnsDelta;
			this.phase = advanced.phase;

			if (advanced.wrapped) {
				this.rebuildFromPhase(this.phase);
			} else {
				sampleToPhase(this.#sampler, this.plotGeometry, this.phase, this.flags(), this.tanClamp);
				this.publishPaths();
				this.scheduleConnectorUpdate();
			}
			this.queueUrlSync();
		});

		this.rebuildFromPhase(this.phase);
		this.updateOverlaySize();
		this.scheduleConnectorUpdate();

		return () => {
			this.#rafLoop.stop();
			this.#connectorFrame.cancel();
			window.clearTimeout(this.#urlTimer);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleScroll, true);
			if (resizeObserver && this.visualizationEl) {
				resizeObserver.unobserve(this.visualizationEl);
			}
		};
	}

	reset() {
		this.phase = 0;
		this.turns = 0;
		this.running = false;
		this.rebuildFromPhase(this.phase);
		this.queueUrlSync();
	}

	toUrlState(): VizUrlState {
		return {
			phase: this.phase,
			speed: this.speed,
			unit: this.unit,
			showSin: this.showSin,
			showCos: this.showCos,
			showTan: this.showTan,
			tanClamp: this.tanClamp,
			showTanConstruction: this.showTanConstruction,
			running: this.running
		};
	}

	applyUrlState(state: VizUrlState, { rebuild = true } = {}) {
		this.#suppressUrl = true;
		this.phase = state.phase;
		this.speed = state.speed;
		this.unit = state.unit;
		this.showSin = state.showSin;
		this.showCos = state.showCos;
		this.showTan = state.showTan;
		this.tanClamp = state.tanClamp;
		this.showTanConstruction = state.showTanConstruction;
		this.running = state.running;
		if (rebuild) this.rebuildFromPhase(this.phase);
		this.#suppressUrl = false;
	}

	hydrateFromLocation() {
		if (typeof window === 'undefined') return;
		const search = window.location.search.replace(/^\?/, '');
		if (!search) return;
		this.applyUrlState(parseVizSearchParams(search, DEFAULT_VIZ_URL_STATE));
	}

	queueUrlSync() {
		if (this.#suppressUrl || typeof window === 'undefined') return;
		window.clearTimeout(this.#urlTimer);
		this.#urlTimer = window.setTimeout(() => {
			replaceUrlSearch(serializeVizSearchParams(this.toUrlState()));
		}, 120);
	}

	async copyShareLink() {
		replaceUrlSearch(serializeVizSearchParams(this.toUrlState()));
		const url = window.location.href;
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(url);
			return url;
		}
		return url;
	}
}
