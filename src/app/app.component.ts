import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  VERSION,
  ViewChild,
} from '@angular/core';
import { findClosestEdge, findClosestElement } from './algorithms';
import { paintAllBorders, paintEdge, resetAllBorders } from './painter';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.state.mode = 'hover';
  }

  state = {
    copiedElement: null,
    selectedElement: null,

    mode: 'hover', // hover, insert, selected
    prevHover: null,
    prevHighlightedEdgeElement: null,
    prevPseudoElement: null,
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @ViewChild('page') page?: ElementRef;
  @ViewChild('output') output?: ElementRef;

  mouseMove(event) {
    if (this.state.mode == 'insert') {
      this.highlightClosestRectangleEdges(event);
    } else if (this.state.mode == 'hover') {
      this.highlightElementAtPoint(event);
    } else if (this.state.mode == 'selected') {
    }
  }

  resetSelectedElement() {
    if (this.state.selectedElement)
      resetAllBorders([this.state.selectedElement]);
    this.state.selectedElement = null;
    this.state.mode = 'hover';
  }

  i = 0;
  click(event) {
    if (this.state.mode == 'insert') {
      // insert element
      let btn = document.createElement('div');
      btn.innerHTML = 'Click Me ' + this.i++;
      btn.style.border = '1px solid green';
      btn.style.padding = '5px';
      btn.style.margin = '20px';
      btn.classList.add('element');
      this.state.copiedElement = btn;

      this.insertElement(event);
    } else {
      this.selectElement(event);
    }
  }

  selectElement(event) {
    let e = this.getElementBelowCursor(event);

    if (!e) {
      this.resetSelectedElement();
      return;
    }

    if (this.state.selectedElement) {
      resetAllBorders([this.state.selectedElement]);
      if (e == this.state.selectedElement) {
        this.resetSelectedElement();
        return; // unselect current element;
      }
    }
    this.state.selectedElement = e;
    paintAllBorders([e], '2px solid red');
  }

  insertElement(event) {
    let container = this.getElementBelowCursor(event);
    let children = Array.from(container.children);

    let sibling = findClosestElement(children, event.x, event.y);

    let edge = 'left';
    if (sibling && sibling.getBoundingClientRect)
      edge = findClosestEdge(sibling.getBoundingClientRect(), event.x, event.y);

    if (edge == 'left' || edge == 'top') {
      container.insertBefore(this.state.copiedElement, sibling);
    } else {
      container.insertBefore(this.state.copiedElement, sibling.nextSibling);
    }
  }

  highlightElementAtPoint(event) {
    let e = this.getElementBelowCursor(event);

    // reset previous hovered element (except if it's selected)
    if (this.state.prevHover != this.state.selectedElement) {
      resetAllBorders([this.state.prevHover]);
    }

    // highlight current hovered element
    if (!e) return;
    if (e && e == this.state.selectedElement) return;

    paintAllBorders([e]);
    this.state.prevHover = e;
  }

  showPseudoElement(event: any) {
    let elementBelowCursor = this.getElementBelowCursor(event);

    if (!elementBelowCursor) {
      return;
    }

    if (this.state.prevHighlightedEdgeElement)
      this.state.prevPseudoElement.remove();
    let elements = Array.from(elementBelowCursor.childNodes);

    let closestElement = findClosestElement(elements, event.x, event.y);

    if (!closestElement) return;

    let closestEdge = findClosestEdge(
      closestElement.getBoundingClientRect(),
      event.x,
      event.y
    );

    if (closestEdge == 'left' || closestEdge == 'top') {
      // show on left
    } else {
    }

    this.state.prevPseudoElement = closestElement;
  }

  highlightClosestRectangleEdges(event: any) {
    let elementBelowCursor = this.getElementBelowCursor(event);

    if (!elementBelowCursor) {
      return;
    }

    if (this.state.prevHighlightedEdgeElement)
      resetAllBorders([this.state.prevHighlightedEdgeElement]);
    let elements = Array.from(elementBelowCursor.childNodes);

    let closestElement = findClosestElement(elements, event.x, event.y);

    if (!closestElement) return;

    let closestEdge = findClosestEdge(
      closestElement.getBoundingClientRect(),
      event.x,
      event.y
    );

    this.state.prevHighlightedEdgeElement = closestElement;

    paintEdge(closestElement, closestEdge);
  }

  getElementBelowCursor(event: MouseEvent) {
    let elementFromPoint = this.document.elementFromPoint(event.x, event.y);

    if (!elementFromPoint) {
      return;
    }

    let closest = elementFromPoint.classList.contains('element')
      ? elementFromPoint
      : elementFromPoint.closest('.element');

    return closest;
  }
}
