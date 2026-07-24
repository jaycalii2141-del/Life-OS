import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2';

/**
 * Mounts Life HQ's interactive Rive "Life Core" into a canvas.
 *
 * Expected editor contract:
 * - file: /rive/life-core.riv
 * - state machine: "Life Core"
 * - optional numeric inputs: Readiness, Energy, Focus, Body, Mood
 * - optional trigger inputs: Celebrate, Listen
 */
export function mountLifeCore(canvas, state = {}) {
  if (!canvas) throw new Error('mountLifeCore requires a canvas element');

  const instance = new Rive({
    src: '/rive/life-core.riv',
    canvas,
    stateMachines: 'Life Core',
    autoplay: true,
    autoBind: true,
    useOffscreenRenderer: true,
    isTouchScrollEnabled: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: () => {
      instance.resizeDrawingSurfaceToCanvas();
      syncLifeCore(instance, state);
    },
  });

  const resize = () => instance.resizeDrawingSurfaceToCanvas();
  window.addEventListener('resize', resize, { passive: true });

  return {
    rive: instance,
    update(nextState) {
      syncLifeCore(instance, nextState);
    },
    destroy() {
      window.removeEventListener('resize', resize);
      instance.cleanup();
    },
  };
}

export function syncLifeCore(instance, state = {}) {
  const inputs = instance.stateMachineInputs?.('Life Core') || [];
  const byName = Object.fromEntries(inputs.map((input) => [input.name, input]));

  const numeric = {
    Readiness: state.readiness,
    Energy: state.energy,
    Focus: state.focus,
    Body: state.body,
    Mood: state.mood,
  };

  Object.entries(numeric).forEach(([name, value]) => {
    if (byName[name] && Number.isFinite(value)) byName[name].value = value;
  });

  if (state.celebrate && byName.Celebrate?.fire) byName.Celebrate.fire();
  if (state.listening && byName.Listen?.fire) byName.Listen.fire();
}
