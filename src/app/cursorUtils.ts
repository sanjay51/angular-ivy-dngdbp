import { findClosestEdge, findClosestElement } from './algorithms';
import { paintAllBorders, resetAllBorders } from './painter';

export function getElementBelowCursor(
  document: any,
  event: MouseEvent,
  isDrag = false
) {
  let elementFromPoint = document.elementFromPoint(event.x, event.y);

  if (!elementFromPoint) {
    return;
  }

  let closest = elementFromPoint.classList.contains('element')
    ? elementFromPoint
    : elementFromPoint.closest('.element');

  if (!closest && !isDrag) {
    closest = elementFromPoint.classList.contains('page')
      ? elementFromPoint
      : elementFromPoint.closest('.page');
  }

  return closest;
}

export function insertElementNearCursor(event, element: any, document: any) {
  let container = getElementBelowCursor(document, event);
  let children = Array.from(container.children);

  let sibling = findClosestElement(children, event.x, event.y);

  let edge = 'left';
  if (sibling && sibling.getBoundingClientRect)
    edge = findClosestEdge(sibling.getBoundingClientRect(), event.x, event.y);

  if (edge == 'left' || edge == 'top') {
    container.insertBefore(element, sibling);
  } else {
    container.insertBefore(element, sibling.nextSibling);
  }
}

export function hoverElementBelowCursor(
  document: any,
  event,
  prevHoverElement,
  currentSelectedElement: any
) {
  /** CONDITIONS **
    * There is an 'element' below cursor
    * It's not already selected.

  ** ACTIONS **
    * reset previous hovered element
    * paint current hover element.
    * update state.prevHover
  */

  // reset previous hovered element (except if it's selected)
  if (prevHoverElement && prevHoverElement != currentSelectedElement) {
    resetAllBorders([prevHoverElement]);
  }

  let e = getElementBelowCursor(document, event);

  // highlight current hovered element
  if (!e) return;
  if (e && e == currentSelectedElement) return;

  paintAllBorders([e]);
  return e;
}
