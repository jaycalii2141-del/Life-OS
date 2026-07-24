// A lightweight, purely decorative atmosphere shared by every screen.
// CSS gradients and transforms keep it fluid without a canvas render loop.
export function LiquidAtmosphere() {
  return (
    <div className="liquid-atmosphere" aria-hidden="true">
      <div className="liquid-orb liquid-orb--one" />
      <div className="liquid-orb liquid-orb--two" />
      <div className="liquid-orb liquid-orb--three" />
      <div className="liquid-ribbon liquid-ribbon--one" />
      <div className="liquid-ribbon liquid-ribbon--two" />
      <div className="liquid-caustics" />
    </div>
  );
}
