/* eslint-disable @typescript-eslint/no-require-imports */
const { TestEnvironment: NodeEnvironment } = require("jest-environment-node");
const { JSDOM } = require("jsdom");

class JsdomWithNodeApis extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    // Set up jsdom for DOM APIs
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
      url: "http://localhost",
    });

    // Copy jsdom window properties
    const domProps = [
      "window", "document", "navigator", "HTMLElement", "SVGElement",
      "Document", "Element", "Node", "DOMParser", "XMLSerializer",
      "getComputedStyle", "localStorage", "sessionStorage",
    ];
    for (const name of domProps) {
      if (typeof this.global[name] === "undefined" && dom.window[name]) {
        this.global[name] = dom.window[name];
      }
    }
    if (typeof this.global.matchMedia === "undefined") {
      this.global.matchMedia = dom.window.matchMedia || (() => ({
        matches: false, addListener: () => {}, removeListener: () => {},
      }));
    }

    // Copy Node.js native web APIs that jsdom doesn't provide
    const apis = [
      "fetch", "Request", "Response", "Headers",
      "URL", "URLSearchParams",
      "AbortController", "AbortSignal",
      "TextEncoder", "TextDecoder",
      "ReadableStream", "WritableStream", "TransformStream",
      "Blob", "File", "FormData",
      "Event", "EventTarget", "CustomEvent",
      "structuredClone",
    ];

    for (const name of apis) {
      if (typeof this.global[name] === "undefined" && typeof globalThis[name] !== "undefined") {
        this.global[name] = globalThis[name];
      }
    }
  }
}

module.exports = JsdomWithNodeApis;
