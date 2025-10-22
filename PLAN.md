# ESLint Class Name Validator Plugin - Implementation Plan

## Project Overview

An ESLint plugin that validates CSS class names in HTML and JSX files by checking them against actual CSS/SCSS files, Tailwind configuration, and user-defined whitelists. The plugin prevents runtime errors from typos and non-existent class names during development. Supports both standard HTML `class` attributes and JSX `className` attributes.

## Core Objectives

- Detect invalid CSS class names at lint time
- Support multiple CSS sources (CSS files, SCSS, Tailwind, CSS Modules)
- Provide helpful error messages with suggestions for typos
- Maintain high performance through caching
- Support popular frameworks (React, Vue, Angular)

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
- **CSS Modules Handler**: Track module-scoped classes

### 5. Tailwind Integration

- **Config Loader**: Read and parse tailwind.config.js
- **Class Generator**: Generate all possible Tailwind utility classes
- **Variant Builder**: Create variant combinations (hover:, sm:, dark:)
- **Arbitrary Value Handler**: Support JIT mode bracket syntax
- **Safelist Processor**: Include safelisted patterns and classes
- **Component Class Extractor**: Find custom component classes

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

### Phase 4: Tailwind Integration

Connect to Tailwind configuration and generate utility classes. Support variants, arbitrary values, and custom utilities. Handle both JIT and AOT modes.

### Phase 5: Dynamic Classes

Add support for template literals, conditional expressions, and utility functions like clsx. Implement configurable handling strategies for dynamic content.

### Phase 6: Framework Support

Extend support to Vue templates, Angular templates, and HTML files. Handle framework-specific class binding syntax.

### Phase 7: Advanced Features

Implement intelligent suggestions for typos, CSS Modules support, and performance optimizations. Add detailed configuration options.

## Configuration Design

### Rule Options Structure

- **sources**: Define where to look for valid classes
  - **css**: Array of glob patterns for CSS files
  - **scss**: Array of glob patterns for SCSS files
  - **tailwind**: Boolean or config object
  - **cssModules**: Boolean to enable CSS Modules support

- **validation**: Control validation behavior
  - **whitelist**: Array of always-valid class patterns
  - **blacklist**: Array of forbidden class patterns
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
- [x] Create whitelist/blacklist support

### CSS Processing

- [x] Integrate PostCSS for CSS parsing
- [x] Implement glob-based file discovery
- [x] Create CSS class selector extractor
- [x] Add SCSS compilation with Sass
- [x] Handle nested selectors and pseudo-classes

### Tailwind Support

- [x] Load and parse Tailwind configuration
- [x] Generate utility classes from config
  - [x] Implement theme value flattening for nested objects
  - [x] Generate color utilities (bg-, text-, border-, ring-, etc.)
  - [x] Generate spacing utilities (padding, margin, gap, inset)
  - [x] Generate sizing utilities (width, height, min/max variants)
  - [x] Generate typography utilities (font, text, leading, tracking)
  - [x] Generate layout utilities (display, position, visibility, z-index)
  - [x] Generate flexbox and grid utilities
  - [x] Generate border utilities (width, radius, style, divide, ring, outline)
  - [x] Generate effect utilities (shadow, opacity, blend modes)
  - [x] Generate transform utilities (translate, rotate, scale, skew)
  - [x] Generate filter utilities (blur, brightness, contrast, grayscale, etc.)
  - [x] Generate backdrop filter utilities
  - [x] Generate background utilities (size, position, repeat, attachment, clip, origin)
  - [x] Generate transition and animation utilities
  - [x] Generate interactivity utilities (cursor, pointer-events, resize, scroll, etc.)
  - [x] Generate SVG utilities (fill, stroke)
  - [x] Generate accessibility utilities (sr-only)
- [x] Build variant combinations (infrastructure in place)
- [x] Support arbitrary value syntax
- [x] Process safelist patterns
- [x] Handle custom utilities and components (via build-based extraction with execSync)
- [ ] Implement JIT mode support

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
- [ ] Implement memoization for variant parsing results
- [ ] Reduce string allocations in class name extraction

**Tier 2: Startup/Load Time Optimizations** _(one-time cost per lint session)_

- [ ] Add parallel CSS/SCSS file parsing with Promise.all
- [ ] Cache glob resolution results with mtime validation
- [ ] Optimize Set/Map usage for large class registries

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
- [ ] Add CSS Modules support
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

### Dynamic Class Handling (Nice to Have)

- Parse template literals with static/dynamic parts
- Handle conditional expressions
- Support clsx/classnames utility patterns
- Process computed property names
- Implement configurable dynamic handling

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
