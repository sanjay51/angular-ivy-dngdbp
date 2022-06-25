import {
  Component,
  ElementRef,
  QueryList,
  VERSION,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { findClosestEdge, findClosestElement } from './algorithms';
import { paintAllBorders, paintEdge } from './painter';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;

  constructor() {}

  @ViewChild('page') page?: ElementRef;
  @ViewChild('output') output?: ElementRef;

  highlightClosestRectangleEdges(event: any) {
    let elements = this.page.nativeElement.childNodes;

    paintAllBorders(elements);
    let closetElement = findClosestElement(elements, event.x, event.y);

    let closestEdge = findClosestEdge(
      closetElement.getBoundingClientRect(),
      event.x,
      event.y
    );

    paintEdge(closetElement, closestEdge);
  }
}
