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

    if (this.state.prevPseudoElement) this.state.prevPseudoElement.remove();
    this.state.prevPseudoElement = null;
  }

  state = {
    copiedElement: null,
    selectedElement: null,

    mode: 'hover', // hover, insert, drag
    prevHover: null,
    prevHighlightedEdgeElement: null,
    prevPseudoElement: null,

    dragElement: null,
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @ViewChild('page') page?: ElementRef;
  @ViewChild('output') output?: ElementRef;

  isMouseDown = false;
  isDrag = false;

  mouseMove(event) {
    if (this.isMouseDown) {
      this.isDrag = true;
      this.state.mode = 'drag';
    }

    if (this.state.mode == 'drag') {
      this.drag(event);
      this.showPseudoElement(event);
    } else if (this.state.mode == 'insert') {
      //this.highlightClosestRectangleEdges(event);
      this.showPseudoElement(event);
    } else if (this.state.mode == 'hover') {
      this.highlightElementAtPoint(event);
    } else if (this.state.mode == 'selected') {
    }
  }

  drag(event) {
    event.preventDefault();

    let e = this.state.dragElement;
    if (!e) {
      e = this.getElementBelowCursor(event) as HTMLElement;
    }

    if (!e) return;

    e.style.position = 'absolute';
    e.style.left = event.pageX - 100 + 'px';
    e.style.top = event.pageY - 100 + 'px';

    this.state.mode = 'drag';
    this.state.dragElement = e;
  }

  drop(event) {
    this.isMouseDown = false;
    this.isDrag = false;

    let e = this.state.dragElement;

    if (!e) return;

    event.preventDefault();
    this.state.dragElement.style.position = '';
    this.state.dragElement.style.left = '';
    this.state.dragElement.style.top = '';
    this.state.copiedElement = this.state.dragElement;
    this.insertElement(event);
    this.state.dragElement = null;
    this.state.mode = 'hover';
  }

  resetSelectedElement() {
    if (this.state.selectedElement)
      resetAllBorders([this.state.selectedElement]);
    this.state.selectedElement = null;
    this.state.mode = 'hover';
  }

  i = 0;
  click(event) {
    if (this.isDrag) return;

    if (this.state.mode == 'insert') {
      // insert element
      let btn = document.createElement('div');
      btn.innerHTML = 'Click Me ' + this.i++;
      btn.style.border = '1px solid green';
      btn.style.padding = '5px';
      btn.style.margin = '20px';
      btn.style.display = 'inline-block';
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

    if (this.state.prevPseudoElement) this.state.prevPseudoElement.remove();
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

    if (this.state.prevPseudoElement) this.state.prevPseudoElement.remove();
    let elements = Array.from(elementBelowCursor.childNodes);

    let closestElement = findClosestElement(elements, event.x, event.y);

    let closestEdge = 'left';
    if (closestElement) {
      closestEdge = findClosestEdge(
        closestElement.getBoundingClientRect(),
        event.x,
        event.y
      );
    }

    // pseudo element
    let pseudo = document.createElement('div');
    pseudo.style.border = '1px solid lightgray';
    pseudo.style.backgroundColor = 'lightgray';
    pseudo.classList.add('pseudo-element');
    pseudo.style.padding = '5px';
    pseudo.style.margin = '2px';
    pseudo.style.display = 'inline-block';
    pseudo.classList.add('element');

    if (closestEdge == 'left' || closestEdge == 'top') {
      // show on left
      elementBelowCursor.insertBefore(pseudo, closestElement);
    } else {
      elementBelowCursor.insertBefore(pseudo, closestElement.nextSibling);
    }

    this.state.prevPseudoElement = pseudo;
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
