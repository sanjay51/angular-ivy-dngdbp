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
import { PseudoElement } from './pseudoElementHandler';

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
    this.pseudoElement.remove();
  }

  state = {
    copiedElement: null,
    selectedElement: null,

    mode: 'hover', // hover, insert, drag
    prevHover: null,

    dragElement: null,
  };

  pseudoElement: PseudoElement;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.pseudoElement = new PseudoElement(document);
  }

  @ViewChild('page') page?: ElementRef;
  @ViewChild('output') output?: ElementRef;

  isMouseDown = false;
  isDrag = false;

  mouseMove(event) {
    if (this.isMouseDown || this.state.mode == 'drag') {
      this.drag(event);
    } else if (this.state.mode == 'insert') {
      this.pseudoElement.insertAt(event);
    } else if (this.state.mode == 'hover') {
      let e = hoverElementBelowCursor(
        this.document,
        event,
        this.state.prevHover,
        this.state.selectedElement
      );
      this.state.prevHover = e;
    } else if (this.state.mode == 'selected') {
    }
  }

  drag(event) {
    event.preventDefault();
    this.state.mode = 'drag';

    let e = this.state.dragElement;
    if (!e) {
      e = getElementBelowCursor(this.document, event) as HTMLElement;

      if (!e) return;

      this.state.dragElement = e.cloneNode(true);
      e.remove();
      e = this.state.dragElement;
    }

    e.style.position = 'absolute';
    e.style.left = event.pageX - 100 + 'px';
    e.style.top = event.pageY - 100 + 'px';

    this.state.dragElement = e;
    this.pseudoElement.insertAt(event);
  }

  drop(event) {
    this.isMouseDown = false;
    this.isDrag = false;
    this.state.mode = 'hover';

    let e = this.state.dragElement;

    if (!e) return;

    event.preventDefault();
    this.state.dragElement.style.position = '';
    this.state.dragElement.style.left = '';
    this.state.dragElement.style.top = '';
    this.state.copiedElement = this.state.dragElement;
    insertElementNearCursor(event, this.state.copiedElement, this.document);

    this.pseudoElement.remove();
    this.state.copiedElement = null;
    this.state.dragElement = null;
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
      btn.style.margin = '5px';
      btn.style.display = 'inline-block';
      btn.classList.add('element');
      this.state.copiedElement = btn;

      insertElementNearCursor(event, this.state.copiedElement, this.document);
      this.pseudoElement.remove();
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

    if (!e) return;

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
}
