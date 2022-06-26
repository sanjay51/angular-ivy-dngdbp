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
import {
  getElementBelowCursor,
  hoverElementBelowCursor,
  insertElementNearCursor,
} from './cursorUtils';
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
      this.insertPseudoElement(event);
    } else if (this.state.mode == 'insert') {
      this.insertPseudoElement(event);
    } else if (this.state.mode == 'hover') {
      hoverElementBelowCursor(
        event,
        this.state.prevHover,
        this.state.selectedElement
      );
    } else if (this.state.mode == 'selected') {
    }
  }

  drag(event) {
    event.preventDefault();

    let e = this.state.dragElement;
    if (!e) {
      e = getElementBelowCursor(this.document, event) as HTMLElement;
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
    insertElementNearCursor(event, this.state.copiedElement, this.document);

    if (this.state.prevPseudoElement) this.state.prevPseudoElement.remove();
    this.state.dragElement = null;
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

      insertElementNearCursor(event, this.state.copiedElement, this.document);
      if (this.state.prevPseudoElement) this.state.prevPseudoElement.remove();
    } else {
      let element = this.selectElementAtCursor(event);

      if (!element) {
        this.unselectElement(this.state.selectedElement);
      } else {
        this.state.selectedElement = element;
      }
    }
  }

  selectElementAtCursor(event) {
    let e = getElementBelowCursor(this.document, event);

    if (this.state.selectedElement) {
      resetAllBorders([this.state.selectedElement]);
      if (e == this.state.selectedElement) {
        this.unselectElement(e);
        return; // unselect current element;
      }
    }
    paintAllBorders([e], '2px solid red');

    return e;
  }

  unselectElement(element: any) {
    if (element) resetAllBorders([element]);
    this.state.selectedElement = null;
    this.state.mode = 'hover';
  }

  insertPseudoElement(event: any) {
    /** CONDITIONS *
     * There is an 'element' below cursor.
     *
     * ACTIONS *
     * remove previous pseudo element
     * find closest element (under element below cursor)
     * find closest edge of the closest element
     * add a pseudo element below or above
     * update state.prevPseudoElement
     */
    let elementBelowCursor = getElementBelowCursor(this.document, event);

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
}
