import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  VERSION,
  ViewChild,
} from '@angular/core';
import { CursorUtils } from './cursorUtils';
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
    this.isMouseDown = false;
  }

  state = {
    mode: 'hover', // hover, insert, drag
    prevHover: null,

    dragElement: null,
  };

  pseudoElement: PseudoElement;
  cursorUtils: CursorUtils;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.pseudoElement = new PseudoElement(document);
    this.cursorUtils = new CursorUtils(document);
  }

  @ViewChild('page') page?: ElementRef;
  @ViewChild('output') output?: ElementRef;

  isMouseDown = false;

  mouseMove(event) {
    if (this.state.mode == 'insert') {
      this.pseudoElement.insert(
        event,
        this.cursorUtils.getElementBelowCursor(event)
      );
    } else if (this.isMouseDown) {
      this.drag(event);
    } else if (this.state.mode == 'hover') {
      let e = this.cursorUtils.hoverElementBelowCursor(
        event,
        this.state.prevHover
      );
      this.state.prevHover = e;
    }
  }

  i = 0;
  click(event) {
    if (this.state.mode == 'insert') {
      // insert element
      let btn = document.createElement('div');
      btn.innerHTML = 'Click Me ' + this.i++;
      btn.style.border = '1px solid green';
      btn.style.padding = '5px';
      btn.style.margin = '5px';
      btn.style.display = 'inline-block';
      btn.classList.add('element');

      this.cursorUtils.insertElementNearCursor(event, btn);
      this.pseudoElement.remove();
    } else {
      // hover click
      this.cursorUtils.selectElementAtCursor(event);
    }
  }

  drag(event) {
    event.preventDefault();
    this.state.mode = 'drag';

    let e = this.state.dragElement;
    if (!e) {
      // start drag
      e = this.cursorUtils.getElementBelowCursor(event, true) as HTMLElement;

      if (!e) return;

      this.state.dragElement = e.cloneNode(true);
      e.remove();
      e = this.state.dragElement;
    }

    this.pseudoElement.insert(
      event,
      this.cursorUtils.getElementBelowCursor(event)
    );
  }

  drop(event) {
    if (this.state.mode == 'insert') return;

    this.isMouseDown = false;
    this.state.mode = 'hover';

    let e = this.state.dragElement;

    if (!e) return;

    event.preventDefault();
    this.state.dragElement.style.position = '';
    this.state.dragElement.style.left = '';
    this.state.dragElement.style.top = '';
    this.cursorUtils.insertElementNearCursor(event, this.state.dragElement);

    this.pseudoElement.remove();
    this.state.dragElement = null;
  }
}
