// @ts-ignore
import * as TWEEN from "@tweenjs/tween.js/dist/tween.esm.js";

export function tween({
  obj,
  to,
  duration,
  easing,
  timeout,
}: {
  obj: Object;
  to: Object;
  duration: number;
  easing: any;
  timeout?: number;
}): void {
  setTimeout(() => {
    const tween = new TWEEN.Tween(obj).to(to, duration).easing(easing).start();
    function animate() {
      tween.update();
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    setTimeout(() => tween.stop(), duration);
  }, timeout || 0);
}
