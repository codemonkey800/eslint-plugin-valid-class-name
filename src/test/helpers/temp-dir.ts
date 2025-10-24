/**
 * Temporary directory management for tests
 * Provides a clean API for creating and managing test files
 */

// eslint-disable-next-line n/no-unpublished-import
import { afterEach, beforeEach } from '@jest/globals'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Manages a temporary directory for testing
 */
export class TempDir {
  public readonly path: string

  constructor(prefix: string) {
    this.path = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`))
  }

  /**
   * Create a file with the given content
   * Automatically creates parent directories if needed
   */
  createFile(filename: string, content: string): string {
    const filePath = path.join(this.path, filename)
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(filePath, content)
    return filePath
  }

  /**
   * Create a CSS file with the given class names
   */
  createCssFile(filename: string, classes: string[]): string {
    const css = classes.map(cls => `.${cls} { color: red; }`).join('\n')
    return this.createFile(filename, css)
  }

  /**
   * Create a CSS file with custom content
   */
  createCssFileWithContent(filename: string, content: string): string {
    return this.createFile(filename, content)
  }

  /**
   * Create an SCSS file with the given content
   */
  createScssFile(filename: string, content: string): string {
    return this.createFile(filename, content)
  }

  /**
   * Create a Tailwind config file
   */
  createTailwindConfig(
    filename: string,
    config: Record<string, unknown> = {},
  ): string {
    const content = `module.exports = ${JSON.stringify(config, null, 2)}`
    return this.createFile(filename, content)
  }

  /**
   * Create a directory within the temp directory
   */
  createDir(dirname: string): string {
    const dirPath = path.join(this.path, dirname)
    fs.mkdirSync(dirPath, { recursive: true })
    return dirPath
  }

  /**
   * Get the absolute path for a file within the temp directory
   */
  resolve(...segments: string[]): string {
    return path.join(this.path, ...segments)
  }

  /**
   * Check if a file exists in the temp directory
   */
  exists(filename: string): boolean {
    return fs.existsSync(path.join(this.path, filename))
  }

  /**
   * Read a file from the temp directory
   */
  readFile(filename: string): string {
    return fs.readFileSync(path.join(this.path, filename), 'utf-8')
  }

  /**
   * Clean up the temporary directory
   */
  cleanup(): void {
    if (fs.existsSync(this.path)) {
      fs.rmSync(this.path, { recursive: true, force: true })
    }
  }
}

/**
 * Create a TempDir instance with automatic setup/teardown hooks
 * Returns a proxy that allows accessing the TempDir instance in tests
 *
 * @example
 * const tempDir = useTempDir('my-test')
 *
 * it('should work', () => {
 *   const file = tempDir.createFile('test.txt', 'content')
 *   // tempDir is automatically cleaned up after the test
 * })
 */
export function useTempDir(prefix: string): TempDir {
  let instance: TempDir

  beforeEach(() => {
    instance = new TempDir(prefix)
  })

  afterEach(() => {
    instance.cleanup()
  })

  // Return a proxy that forwards all property access to the instance
  // This allows the returned value to be used before beforeEach runs
  return new Proxy({} as TempDir, {
    get(_, prop: string | symbol) {
      if (typeof prop === 'symbol') {
        return undefined
      }
      return instance[prop as keyof TempDir]
    },
  })
}
