export function resolveAppHeight({
  standalone,
  portrait,
  screenWidth,
  screenHeight,
  innerHeight,
  clientHeight,
}) {
  if (standalone && screenWidth > 0 && screenHeight > 0) {
    const shortSide = Math.min(screenWidth, screenHeight);
    const longSide = Math.max(screenWidth, screenHeight);
    return portrait ? longSide : shortSide;
  }
  return innerHeight || clientHeight || 0;
}

export function appViewportHeight(win = window, doc = document) {
  return resolveAppHeight({
    standalone:
      win.matchMedia('(display-mode: standalone)').matches ||
      win.navigator.standalone === true,
    portrait: win.matchMedia('(orientation: portrait)').matches,
    screenWidth: win.screen?.width || 0,
    screenHeight: win.screen?.height || 0,
    innerHeight: win.innerHeight || 0,
    clientHeight: doc.documentElement.clientHeight || 0,
  });
}
