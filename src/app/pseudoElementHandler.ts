import { findClosestEdge, findClosestElement } from './algorithms';

export class PseudoElement {
  pseudoElement = null;

  constructor(private document: Document) {}

  insertElement(event: any, element: any) {
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

    if (!element) {
      return;
    }

    if (this.pseudoElement) this.remove();
    let elements = Array.from(element.childNodes);

    let closestElement = findClosestElement(elements, event.x, event.y);

    let closestEdge = 'left';
    if (closestElement) {
      closestEdge = findClosestEdge(
        closestElement.getBoundingClientRect(),
        event.x,
        event.y
      );
    }

    let pseudo = this.generatePseudoElement();

    if (closestEdge == 'left' || closestEdge == 'top') {
      // show on left
      element.insertBefore(pseudo, closestElement);
    } else {
      element.insertBefore(pseudo, closestElement.nextSibling);
    }

    this.pseudoElement = pseudo;
  }

  remove() {
    if (this.pseudoElement) this.pseudoElement.remove();
  }

  generatePseudoElement() {
    // pseudo element
    let pseudo = document.createElement('div');
    pseudo.style.border = '1px solid lightgray';
    pseudo.style.backgroundColor = 'lightgray';
    pseudo.classList.add('pseudo-element');
    pseudo.style.padding = '5px';
    pseudo.style.margin = '2px';
    pseudo.style.display = 'inline-block';
    pseudo.classList.add('element');

    return pseudo;
  }
}
