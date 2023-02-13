import {
  DOMParser,
  DOMParserMimeType,
  HTMLCollection,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Element } from "https://deno.land/x/deno_dom@v0.1.36-alpha/src/dom/element.ts";

/**
 * @param data The HTML/XML data to parse.
 * @returns A function that can be used to query the given HTML document using CSS selectors.
 */
export function load(data: string, mimeType: DOMParserMimeType = "text/html") {
  return function (selectors: string) {
    const doc = new DOMParser().parseFromString(data, mimeType);
    if (!doc) return null;
    return new dQuery(
      doc.querySelectorAll(selectors)  as unknown as HTMLCollection,
    );
  };
}

/**
 * A dQuery list. This is a wrapper around a standard HTMLCollection with shorthands for common operations. Comes with a free iterator :)
 */
export class dQuery implements ArrayLike<Element> {
  readonly length: number;
  [n: number]: Element;
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }

  constructor(list: HTMLCollection | Element[]) {
    this.length = list.length;
    for (let i = 0; i < list.length; i++) {
      this[i] = list[i];
    }
  }

  /**
   * Get the value of an attribute for the first element in the set of matched elements.
   * @param key The attribute key.
   * @returns The attribute value or null if it does not exist.
   */
  attr(key: string) {
    return this[0].getAttribute(key);
  }

  /**
   * Get the combined text contents of each element in the set of matched elements, including their descendants.
   */
  get text() {
    return [...this].map((el) => el.textContent).join();
  }

  /**
   * Get the inner HTML contents of the **first** element in the set of matched elements.
   */
  get html() {
    return this[0].innerHTML;
  }

  /*
   * Get the first element in the list as a new dQuery list.
   */
  get first() {
    return new dQuery([this[0]]);
  }

  /**
   * Get the last element in the list.
   */
  get last() {
    return new dQuery([this[this.length - 1]]);
  }

  /**
   * Get the value of a property for the first element in the set of matched elements.
   * @param string The property name.
   * @returns The property value.
   */
  prop(string: keyof Element) {
    return this[0][string];
  }

  /**
   * Check the current matched set of elements against a selector, DOM element, or dQuery object
   * @returns True if the selector matches at least one element in the set; otherwise, false.
   */
  is(match: string | dQuery | Element) {
    if (match instanceof dQuery) {
      return [...this].some((el) => el === match[0]);
    }
    if (match instanceof Element) {
      return [...this].some((el) => el === match);
    }
    if (typeof match === "string") {
      return [...this].some((el) => el.matches(match));
    }
    return false;
  }

  /**
   * Reduce the set of matched elements to those that match the selector or pass the function's test.
   * @param test A string containing a selector expression to match the current set of elements against or a predicate function.
   * @returns A shallow copy of the dQuery object with the filtered elements.
   */
  filter(test: string | ((el: Element | dQuery) => boolean)) {
    let filtered: Element[] = [];
    if (typeof test === "string") {
      filtered = [...this].filter((el) => el.matches(test));
    }
    if (typeof test === "function") {
      filtered = [...this].filter(test);
    }
    return new dQuery(filtered);
  }

  /**
   * Get the descendants of each element in the current set of matched elements, filtered by a selector.
   * @param selectors A string containing a selector expression to match elements against.
   * @returns A shallow copy of the dQuery object with the filtered elements.
   */
  find(selectors: string) {
    return new dQuery(
      this[0].querySelectorAll(selectors) as unknown as HTMLCollection,
    );
  }
}