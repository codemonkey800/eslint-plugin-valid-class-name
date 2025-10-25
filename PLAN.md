# ESLint Class Name Validator Plugin - Implementation Plan

## Project Overview

An ESLint plugin that validates CSS class names in HTML and JSX files by checking them against actual CSS/SCSS files, Tailwind configuration, and user-defined allowlists. The plugin prevents runtime errors from typos and non-existent class names during development. Supports both standard HTML `class` attributes and JSX `className` attributes.

## Core Objectives

- Detect invalid CSS class names at lint time
- Support multiple CSS sources (CSS files, SCSS, Tailwind)
- Provide helpful error messages with suggestions for typos
- Maintain high performance through caching
- Support popular frameworks (React, Vue, Angular)

## Recent Updates

### Tailwind Validation Refactoring (January 2025)

**Major architectural improvement**: Migrated from upfront class generation to on-demand validation using the official Tailwind API via `tailwind-api-utils`.

**Impact:**

- ✅ Removed ~1,800 lines of complex generation code
- ✅ Reduced `tailwind-parser.ts` from 1,838 lines to 49 lines
- ✅ Better accuracy using Tailwind's own validation logic
- ✅ Automatic support for plugins, variants, and arbitrary values
- ✅ Lower memory footprint (no need to store thousands of classes)
- ✅ Faster initialization (lazy validation vs eager generation)

**Files Modified:**

- `src/registry/tailwind-loader.ts`: Now creates `TailwindUtils` instance
- `src/registry/registry-builder.ts`: Updated to use API validation
- `src/registry/class-registry.ts`: Passes TailwindUtils instead of class sets
- `src/parsers/tailwind-parser.ts`: Kept only config path finder
- `package.json`: Added `tailwind-api-utils` dependency

**Current Status:** Phases 1-5 complete (production code ready). Test updates (Phase 6) and documentation (Phase 7) still pending.

## Architecture Components

### 1. Plugin Structure

- **Entry Point**: Main plugin file exporting rules and configurations
- **Rule Definition**: Core validation rule with configurable options
- **AST Visitor**: Component to traverse and analyze code
- **Configuration Schema**: Define all possible plugin options

### 2. Class Name Extraction System

- **JSX Parser**: Extract className attributes from JSX elements
- **HTML Parser**: Extract class attributes from HTML templates
- **Template Literal Handler**: Parse dynamic class names in template strings
- **Expression Handler**: Process conditional and computed class names
- **Utility Function Support**: Recognize clsx/classnames patterns

### 3. Class Registry Builder

- **Registry Manager**: Central system to collect and merge valid classes
- **Source Aggregator**: Combine classes from multiple sources
- **Cache Coordinator**: Manage cached data across sources
- **Pattern Matcher**: Handle wildcard and regex patterns

### 4. CSS/SCSS Processor

- **File Discovery**: Find all relevant CSS/SCSS files using glob patterns
- **CSS Parser**: Use PostCSS to parse standard CSS files
- **SCSS Compiler**: Convert SCSS to CSS using Sass compiler
- **Selector Extractor**: Extract class names from parsed AST
- **Fallback Parser**: Regex-based extraction when parsing fails

### 5. Tailwind Integration

**Note**: As of January 2025, this component uses `tailwind-api-utils` for on-demand validation instead of upfront generation.

- **Config Finder**: Locate tailwind.config.js in project directory
- **Validator Factory**: Create `TailwindUtils` instance for validation
- **API Integration**: Use Tailwind's official `isValidClassName()` for validation
  - Handles all utility classes automatically
  - Validates variants (hover:, sm:, dark:, etc.)
  - Supports arbitrary values (w-[100px], bg-[#ff0000])
  - Processes safelist patterns
  - Validates plugin-generated classes

### 6. Validation Engine

- **Class Validator**: Compare found classes against registry
- **Error Reporter**: Generate ESLint error messages
- **Suggestion Generator**: Provide "did you mean" suggestions
- **Pattern Matcher**: Handle wildcards and ignore patterns
- **Dynamic Class Handler**: Process or skip dynamic classes

### 7. Performance Optimization

- **Memory Cache**: In-memory storage for current session
- **Disk Cache**: Persistent cache between runs
- **File Watcher**: Track changes to source files
- **Incremental Updates**: Only reprocess changed files
- **Lazy Loading**: Defer processing until needed
- **Cache Invalidation**: Smart cache busting strategy

## Implementation Phases

### Phase 1: Foundation

Establish basic plugin structure with simple string literal class validation against a static whitelist. Focus on getting the ESLint integration working correctly.

### Phase 2: CSS Support

Add CSS file parsing using PostCSS. Implement file discovery, class extraction, and basic caching. Support standard CSS selectors and class definitions.

### Phase 3: SCSS Support

Integrate Sass compiler for SCSS files. Handle SCSS-specific features like nesting, mixins, and variables. Implement fallback strategies for compilation errors.

### Phase 4: Tailwind Integration (✅ Complete - Refactored January 2025)

~~Connect to Tailwind configuration and generate utility classes. Support variants, arbitrary values, and custom utilities. Handle both JIT and AOT modes.~~

**Updated Implementation**: Refactored to use `tailwind-api-utils` for on-demand validation instead of upfront class generation. This provides better accuracy, simpler code, and automatic support for all Tailwind features including variants, arbitrary values, and plugin-generated classes.

### Phase 5: Dynamic Classes (Partially Complete)

Add support for template literals, conditional expressions, and utility functions like clsx. Implement configurable handling strategies for dynamic content.

**✅ Completed:**

- Ternary operators (ConditionalExpression): `condition ? 'class1' : 'class2'`
- Logical expressions (LogicalExpression): `condition && 'class'`, `value || 'class'`, `value ?? 'class'`
- Function calls (CallExpression): `cns()`, `clsx()`, `classnames()` with nested expressions
- Template literals without interpolation: `` `class` ``
- Object syntax: `{ 'class': condition }` - extracts keys from object literals
- Array syntax: `['class1', condition && 'class2']` - recursively extracts from array elements
- Recursive expression tree traversal to extract static strings
- Deeply nested combinations of above patterns

**⏸ Not Yet Implemented:**

- Template literals with interpolation: `` `flex-${direction}` `` (currently skipped)
- Variables and identifiers (currently skipped)
- Spread operators in class expressions (currently skipped)
- Computed property names in objects (currently skipped)

### Phase 6: Framework Support

Extend support to Vue templates, Angular templates, and HTML files. Handle framework-specific class binding syntax.

### Phase 7: Advanced Features

Implement intelligent suggestions for typos and performance optimizations. Add detailed configuration options.

## Configuration Design

### Rule Options Structure

- **sources**: Define where to look for valid classes
  - **css**: Array of glob patterns for CSS files
  - **scss**: Array of glob patterns for SCSS files
  - **tailwind**: Boolean or config object

- **validation**: Control validation behavior
  - **ignorePatterns**: Skip validation for matching classes
  - **allowDynamic**: How to handle dynamic classes

- **performance**: Optimize plugin performance
  - **cache**: Enable/disable caching
  - **cacheLocation**: Where to store cache files
  - **parallelProcessing**: Use worker threads

- **features**: Additional functionality
  - **suggestions**: Provide "did you mean" hints
  - **maxSuggestions**: Number of suggestions to show

## Error Reporting Strategy

### Error Types

- **Unknown Class**: Class not found in any source
- **Deprecated Class**: Class marked as deprecated
- **Blacklisted Class**: Class explicitly forbidden
- **Typo Detection**: Likely misspelling of valid class

### Message Format

- Clear identification of invalid class name
- Source file and line number
- Contextual information about where class was expected
- Suggestions for similar valid classes when available
- Link to documentation for complex issues

## Performance Considerations

### Optimization Strategies

- Parse CSS files only once per session
- Cache Tailwind class generation between runs
- Use file modification times for cache invalidation
- Implement progressive loading for large projects
- Parallelize file processing where possible

### Memory Management

- Set maximum cache size limits
- Implement LRU eviction for memory cache
- Stream large files instead of loading entirely
- Clean up resources after validation

### Implementation Techniques

- Compile glob patterns and wildcard matchers to RegExp once
- Memoize expensive parsing operations (variants, class splitting)
- Use hash-based cache keys for large configurations
- Parallelize independent file operations
- Implement copy-on-write for registry updates
- Use typed arrays or bit flags for boolean checks at scale

## Testing Strategy

### Unit Tests

- Class extraction from various JSX patterns
- CSS parsing for different selector types
- Tailwind class generation accuracy
- Cache invalidation logic
- Suggestion algorithm correctness

### Integration Tests

- Full plugin flow with sample projects
- Framework-specific syntax handling
- Performance with large codebases
- Cache persistence across runs
- Configuration option combinations

### Edge Cases

- Malformed CSS/SCSS files
- Missing Tailwind configuration
- Circular dependencies in CSS
- Dynamic imports and code splitting
- Extremely large class registries

## Documentation Requirements

### User Documentation

- Installation and setup guide
- Configuration options reference
- Framework-specific setup instructions
- Performance tuning guidelines
- Troubleshooting common issues

### Developer Documentation

- Architecture overview
- Contributing guidelines
- API documentation for extensions
- Testing instructions
- Release process

## Task Checklist

### Setup and Infrastructure

- [x] Initialize npm package with ESLint plugin template
- [x] Set up TypeScript configuration
- [x] Configure build tooling (rollup/webpack)
- [x] Set up Jest testing framework
- [x] Create basic plugin structure with stub rule
- [x] Implement configuration schema validation
- [x] Configure ESLint with flat config and multiple plugins
- [x] Set up Prettier configuration
- [x] Add lint, type-check, and formatting scripts
- [ ] Set up continuous integration pipeline

### Core Functionality

- [x] Implement JSX className attribute visitor
- [x] Create class name extraction from string literals
- [x] Build basic validation against hardcoded list
- [x] Add ESLint error reporting
- [x] Implement configuration loading

### CSS Processing

- [x] Integrate PostCSS for CSS parsing
- [x] Implement glob-based file discovery
- [x] Create CSS class selector extractor
- [x] Add SCSS compilation with Sass
- [x] Handle nested selectors and pseudo-classes

### Tailwind Support

**✅ Refactored to use `tailwind-api-utils` (January 2025)**

The plugin now uses the official Tailwind API via `tailwind-api-utils` for validation instead of generating all classes upfront. This provides several benefits:

- **Lazy validation**: Classes are validated on-demand using Tailwind's own internal logic
- **Simpler codebase**: Removed ~1,800 lines of custom generation code
- **Better accuracy**: Uses Tailwind's official validation, handles all variants and arbitrary values correctly
- **Plugin support**: Automatically validates plugin-generated classes without manual extraction
- **Lower memory usage**: No need to store thousands of generated classes in memory

**Implementation Status:**

- [x] Load and parse Tailwind configuration using `tailwind-api-utils`
- [x] On-demand validation via `TailwindUtils.isValidClassName()` API
- [x] Support arbitrary value syntax (handled by API)
- [x] Support all variant combinations (handled by API)
- [x] Handle custom utilities and plugins (handled by API)
- [x] Process safelist patterns (handled by API)
- [x] Tailwind CSS v3 support (synchronous config loading)
- [x] Tailwind CSS v4 support (async initialization via synckit worker threads)

**Deprecated/Removed:**

- ~~Manual utility class generation from theme config~~
- ~~execSync-based build extraction for plugin classes~~
- ~~Custom variant validation logic~~
- ~~Safelist extraction code~~

**V4 Support Implementation (January 2025):**

Uses `synckit` to bridge ESLint's synchronous constraint with Tailwind v4's async requirements:
- **tailwind-worker.ts**: Worker thread that handles async config loading
- **tailwind-loader.ts**: Detects v4 and delegates to worker via `createSyncFn()`
- Validation appears synchronous to ESLint rules but runs async in worker thread
- Worker caches loaded configs to avoid reloading on every validation

**Files Changed:**

- `src/registry/tailwind-loader.ts`: Refactored to create `TailwindUtils` instance; added v4 support via synckit
- `src/registry/tailwind-worker.ts`: New worker file for async v4 validation
- `src/registry/registry-builder.ts`: Updated to use API for validation
- `src/registry/class-registry.ts`: Updated to pass `TailwindUtils` instance
- `src/parsers/tailwind-parser.ts`: Reduced from 1,838 lines to 49 lines (kept only config path finder)
- `package.json`: Added `synckit` dependency

### Performance Optimization

**Tier 1: Critical Path Optimizations** _(affects every class validation)_

- [x] Optimize cache key generation (use hash instead of JSON.stringify)
  - **Primary Benefit**: Constant 64-byte output size vs 1KB-85KB for JSON.stringify
  - **Tradeoff**: ~1.5-2x slower generation, uses more heap during generation (crypto overhead)
  - **Why It's Worth It**: Cache keys are stored and compared repeatedly across lint runs. Smaller keys = faster comparisons and better memory efficiency long-term
  - **Benchmark Results** (output size reduction):
    - Small (10 files): 1.13 KB → 64 B (18x smaller, 94.5% reduction)
    - Medium (50 files): 4.63 KB → 64 B (74x smaller, 98.6% reduction)
    - Large (200 files): 17.15 KB → 64 B (274x smaller, 99.6% reduction)
    - Very Large (500 files): 42.30 KB → 64 B (677x smaller, 99.9% reduction)
    - Extreme (1000 files): 84.71 KB → 64 B (1355x smaller, 99.9% reduction)
  - **Implementation**: Use crypto.createHash('sha256') with incremental updates instead of JSON.stringify
  - **Run Benchmark**: `pnpm run bench`
- [x] Compile wildcard patterns to RegExp and cache compiled patterns
  - **Performance Impact**: 14.3x average speedup (8.0x - 21.5x depending on pattern count)
  - **Benchmark Results**:
    - 1 pattern, 100 classes: 8.0x faster (158.93μs → 19.96μs)
    - 5 patterns, 1,000 classes: 6.0x faster (1.87ms → 310.09μs)
    - 10 patterns, 1,000 classes: 18.1x faster (2.84ms → 156.82μs)
    - 10 patterns, 10,000 classes: 17.7x faster (24.15ms → 1.36ms)
    - 20 patterns, 10,000 classes: 21.5x faster (44.72ms → 2.08ms)
  - **Implementation**: Pre-compile wildcard patterns to RegExp at registry creation, reuse compiled patterns for all validations
- [x] Implement memoization for variant parsing results
  - **Impact**: 1.9x speedup for repeated class validation (48.3% time reduction)
  - **Details**:
    - Added Map-based caches for `parseClassName()`, `parseArbitraryValue()`, and `isValidArbitraryValue()`
    - Cache hits are ~100x faster than parsing (0.01μs vs 0.6μs)
    - In typical projects (99% cache hit rate), saves ~48% of variant parsing time
    - Benchmarks: `benchmarks/variant-parsing-benchmark.ts` and `benchmarks/variant-parsing-comparison.ts`
  - **Implementation**: Module-level Map caches with className as key, no size limit (classes are finite per project)
- [x] Reduce string allocations in class name extraction
  - **Status**: ✅ Completed
  - **Results**:
    - **extractClassNamesFromString**: Refactored from map+trim+filter chain to single-pass loop
      - Simple classes (common case): 19% faster (22.47ms → 18.26ms per 100k iterations)
      - Tailwind variants: 13% faster (15.01ms → 13.14ms per 100k iterations)
      - Complex variants: 6% faster (14.97ms → 14.08ms per 100k iterations)
      - Edge case (extra whitespace): 17% faster (18.87ms → 15.67ms per 100k iterations)
      - Large class lists (20 classes): 14% faster (49.10ms → 42.18ms per 10k iterations)
    - **isValidVariant**: Optimized group/peer variant handling
      - Replaced regex `.replace(/^(group|peer)-/, '')` with `.substring()`
      - Group variants: 39% faster (6.44ms → 3.95ms per 100k iterations)
      - Peer variants: 37% faster (6.01ms → 3.78ms per 100k iterations)
  - **Impact**: 10-20% reduction in hot path execution time, eliminates unnecessary string allocations
  - **Implementation**:
    - [valid-class-name.ts:50-77](src/rules/valid-class-name.ts#L50-L77): Single-pass extraction with conditional trim
    - [tailwind-variants.ts:211-218](src/utils/tailwind-variants.ts#L211-L218): Direct substring instead of regex replace
  - **Benchmarks**: `benchmarks/string-allocation-benchmark.ts`

**Tier 2: Startup/Load Time Optimizations** _(one-time cost per lint session)_

- [x] Cache glob resolution results with mtime validation
  - **Status**: ✅ Completed
  - **Performance Impact**: 25.6x - 139.9x speedup (96.1% - 99.3% time reduction)
  - **Benchmark Results** (`benchmarks/glob-cache-benchmark.ts`):
    - **Small projects (10 files)**: 8.89ms → 0.064ms (139.9x faster, 99.3% reduction)
    - **Medium projects (50 files)**: 4.60ms → 0.148ms (31.1x faster, 96.8% reduction)
    - **Large projects (200 files)**: 15.16ms → 0.592ms (25.6x faster, 96.1% reduction)
  - **Real-world impact**: When linting 50 files with 200 CSS files:
    - Without caching: 50 × 15ms = 750ms wasted on repeated glob operations
    - With caching: 15ms (first) + 49 × 0.6ms = 44ms total
    - **Savings: ~700ms (94% faster overall)**
  - **Implementation**:
    - Added `getCachedOrResolveFiles()` function with TTL-based caching (1 second)
    - Caches glob resolution results and validates file mtimes
    - Invalidates on: pattern change, cwd change, file mtime change, file deletion, TTL expiry
    - [class-registry.ts:105-151](src/cache/class-registry.ts#L105-L151): Cache implementation
  - **Why TTL?**: 1-second TTL catches newly created files while maximizing cache hits for typical lint runs
  - **Run Benchmark**: `pnpm run benchmark:glob-cache`
- [x] Optimize Set/Map usage for large class registries
  - **Implementation**: Eliminated eager Set merging in `buildClassRegistry()`, using sequential lookups instead
  - **Results** (from `benchmarks/set-merge-benchmark.ts`):
    - **Build Time**: 100% improvement across all sizes (0.18ms-2.6ms → ~0.000ms)
    - **Lookup Time** (400 validations): 94-311% slower but still fast in absolute terms
      - Small (2,520 classes): 0.012ms → 0.023ms (+0.011ms, 94% overhead)
      - Medium (7,050 classes): 0.013ms → 0.033ms (+0.020ms, 155% overhead)
      - Large (20,100 classes): 0.013ms → 0.040ms (+0.027ms, 218% overhead)
      - Extra Large (35,200 classes): 0.011ms → 0.046ms (+0.035ms, 311% overhead)
    - **Memory Savings**: 355 KB → 4.4 MB depending on project size (lazy uses ~0.1 KB)
    - **P95 Latency**: Lazy lookup p95 is 0.053ms-0.133ms (still negligible for linting)
  - **Trade-off Analysis**:
    - Sacrifice: ~0.03-0.05ms per 400 lookups (negligible in ESLint context where linting takes seconds)
    - Gain: Zero build overhead + MB-scale memory savings
    - Lookup overhead has more variance (higher p95/p99) but worst case (0.221ms for 400 lookups) is still trivial
  - **Why It's Worth It**: Registry build happens once per config change, lookups happen during linting but the absolute overhead (~0.04ms per 400 classes) is unnoticeable when total lint time is measured in seconds
  - **Run Benchmark**: `node --expose-gc --import tsx benchmarks/set-merge-benchmark.ts`

**Tier 3: Persistence & Caching Infrastructure** _(complex, long-term benefits)_

- [ ] Implement disk-based cache persistence
- [ ] Add file modification tracking
- [ ] Create cache invalidation logic
- [ ] Create in-memory cache system

**Tier 4: Watch Mode & Advanced Features** _(nice to have for dev workflows)_

- [ ] Implement file watching for CSS/SCSS source files
- [ ] Build incremental update system
- [ ] Implement lazy loading strategy
- [ ] Add cache size management

### Framework Support

- [ ] Add Vue template support
- [ ] Implement Angular template handling
- [ ] Support HTML file processing
- [ ] Handle framework-specific bindings
- [ ] Process inline styles with classes

### Advanced Features

- [ ] Build typo detection algorithm
- [ ] Create suggestion generation
- [ ] Implement pattern-based ignoring
- [ ] Support workspace/monorepo setups
- [ ] Add detailed error messages
- [ ] Create fix suggestions

### Testing

- [ ] Write unit tests for class extraction
- [ ] Test CSS/SCSS parsing
- [ ] Validate Tailwind generation
- [ ] Test caching mechanisms
- [ ] Create integration test suite
- [ ] Add performance benchmarks
- [ ] Test error message quality

### Documentation

- [ ] Write README with quick start
- [ ] Create detailed configuration guide
- [ ] Document framework integrations
- [ ] Add troubleshooting section
- [ ] Write performance tuning guide
- [ ] Create migration guide from similar tools
- [ ] Add example configurations

### Release Preparation

- [ ] Implement semantic versioning
- [ ] Create changelog
- [ ] Set up npm publishing
- [ ] Add license file
- [ ] Create GitHub release automation
- [ ] Write announcement blog post
- [ ] Submit to ESLint plugin directory

## Success Metrics

### Performance Goals

- Process 1000 files in under 5 seconds
- Cache hit rate above 90% in watch mode
- Memory usage under 100MB for typical projects
- Startup time under 1 second

### Quality Goals

- Zero false positives for valid classes
- Catch 95%+ of typos with suggestions
- Support 90%+ of common CSS patterns
- Work with all major frameworks

### Adoption Goals

- Clear documentation with low learning curve
- Migration path from existing tools
- Active community support
- Regular maintenance and updates

## Dependencies

### Required Libraries

- **postcss**: CSS parsing and AST manipulation
- **sass**: SCSS compilation to CSS
- **fast-glob**: Efficient file system traversal
- **tailwindcss**: Tailwind configuration resolution
- **leven**: String distance for suggestions

### Optional Libraries

- **css-tree**: Alternative CSS parser
- **worker-threads**: Parallel processing
- **chokidar**: File system watching
- **cosmiconfig**: Configuration loading

## Known Challenges

### Technical Challenges

- Handling dynamic class names accurately
- Maintaining performance with large Tailwind configs
- Supporting all CSS/SCSS syntax variations
- Managing memory usage in large projects
- Dealing with build-time generated classes

### User Experience Challenges

- Balancing strictness with flexibility
- Providing helpful error messages
- Making configuration intuitive
- Supporting diverse project structures
- Handling legacy codebases

## Future Enhancements

### Potential Features

- IDE integration for real-time feedback
- Auto-fix capability for typos
- Custom rule extensions API
- Build tool integrations
- CSS-in-JS support
- Design token validation
- Unused class detection
- Class name refactoring tools

### Dynamic Class Handling

**✅ Implemented:**

- [x] Parse template literals without interpolation (static only)
- [x] Handle conditional expressions (ternary operators: `a ? 'b' : 'c'`)
- [x] Support clsx/classnames/cns utility function patterns with nested expressions
- [x] Handle logical expressions (&&, ||, ??)
- [x] Support object syntax in utility functions (e.g., `clsx({ 'class': condition })`)
- [x] Support array syntax in utility functions (e.g., `clsx(['class1', condition && 'class2'])`)
- [x] Recursive extraction of static strings from expression trees
- [x] Support deeply nested combinations of all above patterns

**⏸ Not Yet Implemented:**

- [ ] Parse template literals with dynamic/interpolated parts (e.g., `` `flex-${direction}` ``)
- [ ] Process computed property names in objects (e.g., `{ [dynamicKey]: true }`)
- [ ] Handle spread operators (e.g., `clsx({ ...otherClasses })`)
- [ ] Implement configurable dynamic handling strategies (strict vs permissive modes)

### Ecosystem Integration

- VS Code extension
- Webpack plugin
- Vite plugin
- Next.js integration
- Create React App preset
- Vue CLI plugin

## Notes for Implementation

This document serves as a comprehensive guide for implementing the ESLint class name validator plugin. Each section provides high-level details about components and their responsibilities. The task checklist should be used to track implementation progress, with tasks completed roughly in the order listed to ensure dependencies are met.

Key principles to maintain throughout development:

- Prioritize performance to avoid slowing down development workflows
- Provide clear, actionable error messages
- Make configuration as intuitive as possible
- Support incremental adoption in existing projects
- Maintain backward compatibility when adding features

Regular testing with real-world projects is essential to ensure the plugin works correctly across diverse codebases and development environments.
