// Worker side of the 3D bottle: owns the OffscreenCanvas and draws whenever the page sends a frame.
import { createShowcase } from "./showcase3d.js";

let sc = null, ready = false;
onmessage = async ({ data: m }) => {
  if (m.type === "init") {
    try {
      sc = createShowcase({ canvas: m.canvas, layout: m.layout, dpr: m.dpr, lowPower: m.lowPower, reduced: m.reduced, spin: m.spin });
      await sc.warm();
      ready = true;
      postMessage({ type: "ready" });
    } catch (err) {
      postMessage({ type: "error", message: String(err?.message || err) });
    }
    return;
  }
  if (!ready) { if (m.type === "frame") postMessage({ type: "drawn" }); return; }
  if (m.type === "frame") {
    sc.setStage(m.stage); sc.setPointer(m.tx, m.ty); sc.setVisible(m.visible);
    if (m.visible) sc.frame(m.dt);
    postMessage({ type: "drawn" });
  } else if (m.type === "layout") sc.setLayout(m.layout);
  else if (m.type === "quality") sc.setQuality(m.level);
};
