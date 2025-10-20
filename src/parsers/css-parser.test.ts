import { describe, expect, it } from "@jest/globals";
import { extractClassNamesFromCss } from "./css-parser.js";

describe("extractClassNamesFromCss", () => {
  it("should extract simple class names", () => {
    const css = ".btn { color: red; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should extract multiple class names", () => {
    const css = `
      .btn { color: red; }
      .card { padding: 10px; }
      .header { font-size: 20px; }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.has("card")).toBe(true);
    expect(classes.has("header")).toBe(true);
    expect(classes.size).toBe(3);
  });

  it("should extract classes from pseudo-class selectors", () => {
    const css = ".btn:hover { color: blue; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should extract classes from pseudo-element selectors", () => {
    const css = ".btn::before { content: ''; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should extract classes from compound selectors", () => {
    const css = ".btn.primary { color: blue; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.has("primary")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should extract classes from descendant selectors", () => {
    const css = ".parent .child { color: red; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("parent")).toBe(true);
    expect(classes.has("child")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should extract classes from child selectors", () => {
    const css = ".parent > .child { color: red; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("parent")).toBe(true);
    expect(classes.has("child")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should extract classes from adjacent sibling selectors", () => {
    const css = ".first + .second { margin-top: 10px; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("first")).toBe(true);
    expect(classes.has("second")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should extract classes from general sibling selectors", () => {
    const css = ".first ~ .second { margin-top: 10px; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("first")).toBe(true);
    expect(classes.has("second")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should extract classes from complex selectors", () => {
    const css =
      ".nav .menu-item:hover .dropdown.active { display: block; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("nav")).toBe(true);
    expect(classes.has("menu-item")).toBe(true);
    expect(classes.has("dropdown")).toBe(true);
    expect(classes.has("active")).toBe(true);
    expect(classes.size).toBe(4);
  });

  it("should handle classes with hyphens and underscores", () => {
    const css = `
      .my-button { color: red; }
      .my_button { color: blue; }
      .my-button_2 { color: green; }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("my-button")).toBe(true);
    expect(classes.has("my_button")).toBe(true);
    expect(classes.has("my-button_2")).toBe(true);
    expect(classes.size).toBe(3);
  });

  it("should handle classes with numbers", () => {
    const css = `
      .col-12 { width: 100%; }
      .mt-3 { margin-top: 1rem; }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("col-12")).toBe(true);
    expect(classes.has("mt-3")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should handle multiple selectors in one rule", () => {
    const css = ".btn, .button, .link { cursor: pointer; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.has("button")).toBe(true);
    expect(classes.has("link")).toBe(true);
    expect(classes.size).toBe(3);
  });

  it("should handle at-rules like @media", () => {
    const css = `
      @media (min-width: 768px) {
        .container { max-width: 1200px; }
        .responsive { display: flex; }
      }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("container")).toBe(true);
    expect(classes.has("responsive")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should handle nested at-rules", () => {
    const css = `
      @media (min-width: 768px) {
        @supports (display: grid) {
          .grid-container { display: grid; }
        }
      }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("grid-container")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should handle malformed CSS gracefully", () => {
    const css = ".btn { color: red";
    const classes = extractClassNamesFromCss(css);
    // Should not throw and may still extract some classes
    expect(classes).toBeInstanceOf(Set);
  });

  it("should handle empty CSS", () => {
    const css = "";
    const classes = extractClassNamesFromCss(css);
    expect(classes.size).toBe(0);
  });

  it("should handle CSS with only comments", () => {
    const css = "/* This is a comment */";
    const classes = extractClassNamesFromCss(css);
    expect(classes.size).toBe(0);
  });

  it("should ignore element selectors", () => {
    const css = "div { color: red; } .btn { color: blue; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should ignore ID selectors", () => {
    const css = "#header { color: red; } .btn { color: blue; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should ignore attribute selectors", () => {
    const css = "[data-id='123'] { color: red; } .btn { color: blue; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });

  it("should extract unique classes only once", () => {
    const css = `
      .btn { color: red; }
      .btn:hover { color: blue; }
      .btn.active { color: green; }
    `;
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.has("active")).toBe(true);
    expect(classes.size).toBe(2);
  });

  it("should handle attribute selectors with class names", () => {
    const css =
      ".btn[disabled] { opacity: 0.5; } .btn[data-state='active'] { color: green; }";
    const classes = extractClassNamesFromCss(css);
    expect(classes.has("btn")).toBe(true);
    expect(classes.size).toBe(1);
  });
});
