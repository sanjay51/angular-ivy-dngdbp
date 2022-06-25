export function paintEdge(element: any, edge: string) {
  if (!element) return;

  element.style.border = '1px solid red';

  let s = '2px solid green';

  edge == 'left' ? (element.style.borderLeft = s) : '';
  edge == 'right' ? (element.style.borderRight = s) : '';
  edge == 'top' ? (element.style.borderTop = s) : '';
  edge == 'bottom' ? (element.style.borderBottom = s) : '';
}

export function resetAllBorders(elements: any[]) {
  for (let e of elements) {
    e.style.border = '1px solid red';
  }
}

export function paintAllBorders(
  elements: any[],
  borderStyle: string = '1px dashed red'
) {
  for (let e of elements) {
    e.style.border = borderStyle;
  }
}
