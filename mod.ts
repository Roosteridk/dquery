import {
  DOMParser,
  HTMLCollection,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Element as DOMElement } from "https://deno.land/x/deno_dom@v0.1.36-alpha/src/dom/element.ts";

/**
 * @param html The HTML string to parse.
 * @returns A function that can be used to query the given HTML document using CSS selectors.
 */
export function load(html: string) {
  return function (selectors: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) return null;
    return new DQList(
      doc.querySelectorAll(selectors) as unknown as HTMLCollection,
    );
  };
}

/**
 * A dQuery element. This is a wrapper around a standard DOM element with shorthands for common operations.
 */
export class DQElement {
  constructor(private el: DOMElement) {
    this.el = el;
  }

  get text() {
    return this.el.textContent;
  }

  get html() {
    return this.el.innerHTML;
  }

  get children() {
    return new DQList(this.el.children as HTMLCollection);
  }

  // Hopefully you don't need to use this. It's here if you really need to access the underlying DOM element.
  get element() {
    return this.el;
  }

  attr = (key: string) => this.el.getAttribute(key);
  has = (key: string) => this.el.hasAttribute(key);

  /**
   * Check the current matched set of elements against a selector, DOM element, or dQuery element and return true if at least one of these elements matches the given arguments.
   */
  is(match: string | DQElement | DOMElement) {
    if (match instanceof DQElement) {
      return this.el === match.el;
    }
    if (match instanceof DOMElement) {
      return this.el === match;
    }
    return this.el.matches(match);
  }
}

/**
 * A dQuery list. This is a wrapper around a standard HTMLCollection with shorthands for common operations. Comes with a free iterator :)
 */
export class DQList implements ArrayLike<DQElement> {
  readonly length: number;
  [n: number]: DQElement;
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }

  constructor(list: HTMLCollection) {
    this.length = list.length;
    for (let i = 0; i < list.length; i++) {
      this[i] = new DQElement(list[i]);
    }
  }

  /**
   * Get the value of an attribute for the first element in the set of matched elements.
   * @param key The attribute key.
   * @returns The attribute value or null if it does not exist.
   */
  attr(key: string) {
    return this[0].attr(key);
  }

  /**
   * Get the combined text contents of each element in the set of matched elements, including their descendants.
   */
  get text() {
    return [...this].map((el) => el.text).join();
  }

  /**
   * Get the HTML contents of the **first** element in the set of matched elements.
   */
  get html() {
    return this[0].html;
  }

  /*
   * Get the first element in the list.
   */
  get first() {
    return this[0];
  }

  /**
   * Get the last element in the list.
   */
  get last() {
    return this[this.length - 1];
  }

  /**
   * Get the value of a property for the first element in the set of matched elements.
   * @param string The property name.
   * @returns The property value.
   */
  prop(string: keyof DOMElement) {
    return this[0].element[string];
  }

  /**
   * Reduce the set of matched elements to those that match the selector or pass the function's test.
   * @param test A string containing a selector expression to match the current set of elements against or a predicate function.
   * @returns A shallow copy of the dQuery object with the filtered elements.
   */
  filter(test: string | ((el: DQElement) => boolean)) {
    let filtered: DQElement[] = [];
    if (typeof test === "string") {
      filtered = [...this].filter((el) => el.is(test));
    }
    if (typeof test === "function") {
      filtered = [...this].filter(test);
    }
    return filtered;
  }
}