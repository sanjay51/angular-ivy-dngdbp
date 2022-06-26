import { findClosestEdge, findClosestElement } from './algorithms';
import { paintAllBorders, resetAllBorders } from './painter';

export class CursorUtils {
  constructor(private document: Document) {}

  selectedElement = null;
  public getElementBelowCursor(event: MouseEvent, isDrag = false) {
    let elementFromPoint = this.document.elementFromPoint(event.x, event.y);

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

  public insertElementNearCursor(event, element: any) {
    let container = this.getElementBelowCursor(event);
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

  public hoverElementBelowCursor(event, prevHoverElement) {
    /** CONDITIONS **
    * There is an 'element' below cursor
    * It's not already selected.

  ** ACTIONS **
    * reset previous hovered element
    * paint current hover element.
    * update state.prevHover
  */

    // reset previous hovered element (except if it's selected)
    if (prevHoverElement && prevHoverElement != this.selectedElement) {
      resetAllBorders([prevHoverElement]);
    }

    let e = this.getElementBelowCursor(event);

    // highlight current hovered element
    if (!e) return;
    if (e && e == this.selectedElement) return;

    paintAllBorders([e]);
    return e;
  }

  public selectElementAtCursor(event) {
    let e = this.getElementBelowCursor(event);

    if (!e) return;

    if (this.selectedElement) {
      resetAllBorders([this.selectedElement]);
      if (e == this.selectedElement) {
        this.unselectElement();
        return; // unselect current element;
      }
    }
    paintAllBorders([e], '2px solid red');
    this.selectedElement = e;

    return e;
  }

  public unselectElement() {
    if (this.selectedElement) resetAllBorders([this.selectedElement]);
    this.selectedElement = null;
  }
}
