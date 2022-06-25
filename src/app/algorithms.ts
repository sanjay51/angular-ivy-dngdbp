export interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function findClosestElement(elements: any[], x, y) {
  let minDistance = 1000000;
  let minRect: any;
  for (let rect of elements) {
    if (!rect || !rect.getBoundingClientRect) continue;
    let distance = findRectangleDistance(rect.getBoundingClientRect(), x, y);
    if (distance < minDistance) {
      minDistance = distance;
      minRect = rect;
    }
  }

  return minRect;
}

export function findRectangleDistance(rect: Rectangle, x, y) {
  var dx = Math.max(rect.left - x, 0, x - rect.right);
  var dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

export function findClosestEdge(rect: Rectangle, x, y) {
  if (!rect) return;

  let l = rect.left;
  let t = rect.top;
  let r = rect.right;
  let b = rect.bottom;

  if (l == r) return 'left'; // just a line
  if (t == b) return 'top'; // just a line

  let c = y + (b * (x - r) + t * (l - x)) / (r - l) < 0;
  let d = y + (b * (l - x) + t * (x - r)) / (r - l) < 0;

  let ret =
    (c && d && 'top') ||
    (!c && d && 'right') ||
    (!c && !d && 'bottom') ||
    (c && !d && 'left');

  return ret;

  // false, true => right
  // true, true => top
  // false, false => bottom
  // true, false => left
}
