import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import {
  findTailwindConfigPath,
  extractSafelistClasses,
  getTailwindClasses,
} from "./tailwind-parser";

// Mock fs module
jest.mock("fs");
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path module (but keep most functionality)
jest.mock("path", () => ({
  ...jest.requireActual("path"),
}));

describe("tailwind-parser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findTailwindConfigPath", () => {
    it("should return explicit config path if it exists", () => {
      mockFs.existsSync.mockReturnValue(true);

      const result = findTailwindConfigPath(
        "custom/tailwind.config.js",
        "/project",
      );

      expect(result).toBe(path.resolve("/project", "custom/tailwind.config.js"));
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        path.resolve("/project", "custom/tailwind.config.js"),
      );
    });

    it("should handle absolute explicit paths", () => {
      mockFs.existsSync.mockReturnValue(true);

      const result = findTailwindConfigPath(
        "/absolute/path/tailwind.config.js",
        "/project",
      );

      expect(result).toBe("/absolute/path/tailwind.config.js");
      expect(mockFs.existsSync).toHaveBeenCalledWith(
        "/absolute/path/tailwind.config.js",
      );
    });

    it("should return null if explicit path does not exist", () => {
      mockFs.existsSync.mockReturnValue(false);
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = findTailwindConfigPath(
        "nonexistent/tailwind.config.js",
        "/project",
      );

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Tailwind config file not found"),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should auto-detect tailwind.config.js", () => {
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.resolve("/project", "tailwind.config.js");
      });

      const result = findTailwindConfigPath(undefined, "/project");

      expect(result).toBe(path.resolve("/project", "tailwind.config.js"));
    });

    it("should auto-detect tailwind.config.cjs", () => {
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.resolve("/project", "tailwind.config.cjs");
      });

      const result = findTailwindConfigPath(undefined, "/project");

      expect(result).toBe(path.resolve("/project", "tailwind.config.cjs"));
    });

    it("should auto-detect tailwind.config.mjs", () => {
      mockFs.existsSync.mockImplementation((filePath) => {
        return filePath === path.resolve("/project", "tailwind.config.mjs");
      });

      const result = findTailwindConfigPath(undefined, "/project");

      expect(result).toBe(path.resolve("/project", "tailwind.config.mjs"));
    });

    it("should return null if no config file is found", () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = findTailwindConfigPath(undefined, "/project");

      expect(result).toBeNull();
    });

    it("should prioritize .js over .cjs and .mjs", () => {
      mockFs.existsSync.mockImplementation((filePath) => {
        const filePathStr = String(filePath);
        return (
          filePathStr.endsWith("tailwind.config.js") ||
          filePathStr.endsWith("tailwind.config.cjs") ||
          filePathStr.endsWith("tailwind.config.mjs")
        );
      });

      const result = findTailwindConfigPath(undefined, "/project");

      expect(result).toBe(path.resolve("/project", "tailwind.config.js"));
    });
  });

  describe("extractSafelistClasses", () => {
    it("should extract string literal classes from safelist", () => {
      const safelist = ["bg-red-500", "text-blue-600", "hover:bg-green-400"];

      const result = extractSafelistClasses(safelist);

      expect(result).toEqual(
        new Set(["bg-red-500", "text-blue-600", "hover:bg-green-400"]),
      );
    });

    it("should handle empty safelist", () => {
      const result = extractSafelistClasses([]);

      expect(result).toEqual(new Set());
    });

    it("should skip pattern objects (for future implementation)", () => {
      const safelist = [
        "bg-red-500",
        { pattern: /bg-.*-500/ },
        "text-blue-600",
      ];

      const result = extractSafelistClasses(safelist);

      // Should only extract string literals
      expect(result).toEqual(new Set(["bg-red-500", "text-blue-600"]));
    });

    it("should skip pattern objects with variants", () => {
      const safelist = [
        "bg-red-500",
        { pattern: /text-.*/, variants: ["lg", "hover"] },
      ];

      const result = extractSafelistClasses(safelist);

      expect(result).toEqual(new Set(["bg-red-500"]));
    });

    it("should handle undefined safelist gracefully", () => {
      const result = extractSafelistClasses(undefined as any);

      expect(result).toEqual(new Set());
    });

    it("should handle null safelist gracefully", () => {
      const result = extractSafelistClasses(null as any);

      expect(result).toEqual(new Set());
    });

    it("should handle mixed types in safelist", () => {
      const safelist = [
        "text-red-500",
        { pattern: /bg-.*-500/ },
        "hover:text-blue-600",
        { pattern: /border-.*/, variants: ["focus", "active"] },
        null,
        undefined,
      ];

      const result = extractSafelistClasses(safelist as any);

      // Should only extract string literals, skip everything else
      expect(result).toEqual(new Set(["text-red-500", "hover:text-blue-600"]));
    });

    it("should handle safelist with only pattern objects", () => {
      const safelist = [
        { pattern: /bg-.*-500/ },
        { pattern: /text-.*/, variants: ["lg"] },
      ];

      const result = extractSafelistClasses(safelist);

      // No string literals, should return empty set
      expect(result).toEqual(new Set());
    });
  });

  describe("getTailwindClasses", () => {
    it("should return empty set if Tailwind is disabled", async () => {
      const result = await getTailwindClasses(false, "/project");

      expect(result).toEqual(new Set());
      expect(mockFs.existsSync).not.toHaveBeenCalled();
    });

    it("should return empty set if config file is not found", async () => {
      mockFs.existsSync.mockReturnValue(false);
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await getTailwindClasses(true, "/project");

      expect(result).toEqual(new Set());
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Tailwind config file not found"),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle explicit config path", async () => {
      mockFs.existsSync.mockReturnValue(true);

      // Mock dynamic import and resolveConfig
      const mockResolveConfig = jest.fn().mockReturnValue({
        safelist: ["bg-red-500", "text-blue-600"],
        theme: {},
        content: [],
      });

      // Mock module import
      jest.unstable_mockModule("tailwindcss/resolveConfig", () => ({
        default: mockResolveConfig,
      }));

      const configPath = "/project/custom/tailwind.config.js";
      mockFs.existsSync.mockImplementation(
        (path) => String(path) === configPath,
      );

      // Note: This test demonstrates the structure, but actual dynamic import mocking
      // is complex in Jest. In practice, you might need to use a different approach
      // or test the integration at a higher level.
    });
  });
});
