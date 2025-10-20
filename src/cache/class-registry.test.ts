import { describe, expect, it, beforeEach } from "@jest/globals";
import { getClassRegistry, clearCache } from "./class-registry.js";
import fs from "fs";
import path from "path";
import os from "os";

describe("ClassRegistry", () => {
  let tempDir: string;

  beforeEach(() => {
    // Clear cache before each test
    clearCache();

    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "class-registry-test-"));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("with CSS files", () => {
    it("should extract classes from a single CSS file", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(
        cssFile,
        ".btn { color: red; } .card { padding: 10px; }",
      );

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("btn")).toBe(true);
      expect(registry.isValid("card")).toBe(true);
      expect(registry.isValid("nonexistent")).toBe(false);
    });

    it("should extract classes from multiple CSS files", () => {
      const css1 = path.join(tempDir, "buttons.css");
      const css2 = path.join(tempDir, "cards.css");

      fs.writeFileSync(css1, ".btn { color: red; } .btn-primary { color: blue; }");
      fs.writeFileSync(css2, ".card { padding: 10px; } .card-header { font-weight: bold; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("btn")).toBe(true);
      expect(registry.isValid("btn-primary")).toBe(true);
      expect(registry.isValid("card")).toBe(true);
      expect(registry.isValid("card-header")).toBe(true);
    });

    it("should handle nested glob patterns", () => {
      const nestedDir = path.join(tempDir, "nested");
      fs.mkdirSync(nestedDir);

      const css1 = path.join(tempDir, "root.css");
      const css2 = path.join(nestedDir, "nested.css");

      fs.writeFileSync(css1, ".root-class { color: red; }");
      fs.writeFileSync(css2, ".nested-class { color: blue; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "**/*.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("root-class")).toBe(true);
      expect(registry.isValid("nested-class")).toBe(true);
    });

    it("should handle missing CSS files gracefully", () => {
      const registry = getClassRegistry(
        [path.join(tempDir, "nonexistent.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("anything")).toBe(false);
    });

    it("should ignore node_modules directory", () => {
      const nodeModules = path.join(tempDir, "node_modules");
      fs.mkdirSync(nodeModules);

      const nodeModuleCss = path.join(nodeModules, "library.css");
      fs.writeFileSync(nodeModuleCss, ".library-class { color: red; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "**/*.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("library-class")).toBe(false);
    });
  });

  describe("with whitelist patterns", () => {
    it("should validate literal whitelist entries", () => {
      const registry = getClassRegistry([], ["custom-class", "another-class"], tempDir);

      expect(registry.isValid("custom-class")).toBe(true);
      expect(registry.isValid("another-class")).toBe(true);
      expect(registry.isValid("nonexistent")).toBe(false);
    });

    it("should validate wildcard patterns", () => {
      const registry = getClassRegistry([], ["custom-*", "*-suffix"], tempDir);

      expect(registry.isValid("custom-button")).toBe(true);
      expect(registry.isValid("custom-card")).toBe(true);
      expect(registry.isValid("btn-suffix")).toBe(true);
      expect(registry.isValid("other-class")).toBe(false);
    });

    it("should validate complex wildcard patterns", () => {
      const registry = getClassRegistry([], ["*-btn-*"], tempDir);

      expect(registry.isValid("primary-btn-large")).toBe(true);
      expect(registry.isValid("secondary-btn-small")).toBe(true);
      expect(registry.isValid("btn-primary")).toBe(false);
      expect(registry.isValid("primary-btn")).toBe(false);
    });

    it("should handle multiple wildcard patterns", () => {
      const registry = getClassRegistry(
        [],
        ["custom-*", "app-*", "*-utility"],
        tempDir,
      );

      expect(registry.isValid("custom-button")).toBe(true);
      expect(registry.isValid("app-header")).toBe(true);
      expect(registry.isValid("flex-utility")).toBe(true);
      expect(registry.isValid("random-class")).toBe(false);
    });
  });

  describe("with both CSS files and whitelist", () => {
    it("should validate against both sources", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        ["custom-*"],
        tempDir,
      );

      expect(registry.isValid("btn")).toBe(true);
      expect(registry.isValid("custom-button")).toBe(true);
      expect(registry.isValid("nonexistent")).toBe(false);
    });

    it("should handle overlapping CSS and whitelist entries", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        ["btn", "custom-*"],
        tempDir,
      );

      expect(registry.isValid("btn")).toBe(true);
      expect(registry.isValid("custom-button")).toBe(true);
    });
  });

  describe("caching", () => {
    it("should cache registry with same configuration", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; }");

      const registry1 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );
      const registry2 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry1).toBe(registry2);
    });

    it("should invalidate cache when configuration changes", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; }");

      const registry1 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );
      const registry2 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        ["custom-*"],
        tempDir,
      );

      expect(registry1).not.toBe(registry2);
    });

    it("should invalidate cache when CSS patterns change", () => {
      const css1 = path.join(tempDir, "buttons.css");
      const css2 = path.join(tempDir, "cards.css");

      fs.writeFileSync(css1, ".btn { color: red; }");
      fs.writeFileSync(css2, ".card { padding: 10px; }");

      const registry1 = getClassRegistry(
        [path.join(tempDir, "buttons.css")],
        [],
        tempDir,
      );
      const registry2 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry1).not.toBe(registry2);
      expect(registry1.isValid("card")).toBe(false);
      expect(registry2.isValid("card")).toBe(true);
    });

    it("should invalidate cache when cwd changes", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; }");

      const registry1 = getClassRegistry([path.join(tempDir, "*.css")], [], tempDir);
      const registry2 = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        "/different/path",
      );

      expect(registry1).not.toBe(registry2);
    });
  });

  describe("getAllClasses", () => {
    it("should return all literal class names", () => {
      const cssFile = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssFile, ".btn { color: red; } .card { padding: 10px; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );
      const allClasses = registry.getAllClasses();

      expect(allClasses.has("btn")).toBe(true);
      expect(allClasses.has("card")).toBe(true);
      expect(allClasses.size).toBe(2);
    });

    it("should include literal whitelist entries", () => {
      const registry = getClassRegistry([], ["literal-class"], tempDir);
      const allClasses = registry.getAllClasses();

      expect(allClasses.has("literal-class")).toBe(true);
      expect(allClasses.size).toBe(1);
    });

    it("should not include wildcard patterns in getAllClasses", () => {
      const registry = getClassRegistry([], ["custom-*"], tempDir);
      const allClasses = registry.getAllClasses();

      expect(allClasses.size).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty CSS patterns and whitelist", () => {
      const registry = getClassRegistry([], [], tempDir);

      expect(registry.isValid("anything")).toBe(false);
      expect(registry.getAllClasses().size).toBe(0);
    });

    it("should handle CSS files with no classes", () => {
      const cssFile = path.join(tempDir, "empty.css");
      fs.writeFileSync(cssFile, "body { margin: 0; }");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry.isValid("anything")).toBe(false);
      expect(registry.getAllClasses().size).toBe(0);
    });

    it("should handle malformed CSS gracefully", () => {
      const cssFile = path.join(tempDir, "malformed.css");
      fs.writeFileSync(cssFile, ".btn { color: red");

      const registry = getClassRegistry(
        [path.join(tempDir, "*.css")],
        [],
        tempDir,
      );

      expect(registry).toBeDefined();
    });
  });
});
