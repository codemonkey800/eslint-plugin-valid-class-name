import React from 'react'

/**
 * ObjectStyleInvalid - Demonstrates INVALID object-style class name syntax
 *
 * This component intentionally uses invalid class names to show ESLint errors.
 * The following classes should trigger validation errors:
 * - invalid-class-1, invalid-class-2, invalid-class-3
 * - nonexistent-utility, undefined-style
 *
 * These classes are NOT defined in CSS files, NOT in Tailwind config,
 * and NOT in the whitelist or ignore patterns.
 */

// Mock Card component that accepts classes prop
interface CardProps {
  classes?: {
    root?: string
    header?: string
    body?: string
    footer?: string
  }
  classNames?: {
    container?: string
    title?: string
  }
  children?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ classes, children }) => {
  return (
    <div className={classes?.root}>
      <div className={classes?.header}>{children}</div>
    </div>
  )
}

export const ObjectStyleInvalid: React.FC = () => {
  const condition = true

  return (
    <div className="container">
      {/* Invalid class in object value */}
      <Card
        classes={{
          root: 'invalid-class-1',
          header: 'flex',
        }}
      >
        <h2>Invalid Root Class</h2>
      </Card>

      {/* Multiple invalid classes in single property */}
      <Card
        classes={{
          root: 'invalid-class-2 nonexistent-utility',
          header: 'flex',
        }}
      >
        <h2>Multiple Invalid Classes</h2>
      </Card>

      {/* Invalid class in conditional expression */}
      <Card
        classes={{
          root: condition ? 'card' : 'invalid-class-3',
          header: 'flex',
        }}
      >
        <h2>Invalid Class in Conditional</h2>
      </Card>

      {/* Mixed valid and invalid classes */}
      <Card
        classes={{
          root: 'card',
          header: 'flex items-center',
          body: 'undefined-style',
        }}
      >
        <h2>Mixed Valid and Invalid</h2>
      </Card>

      {/* Invalid class with classNames attribute */}
      <Card
        classNames={{
          container: 'invalid-container-class',
          title: 'text-white',
        }}
      >
        <h2>Invalid with classNames Attribute</h2>
      </Card>

      {/* Invalid class that doesn't match whitelist or ignore patterns */}
      <Card
        classes={{
          root: 'not-custom-pattern',
          header: 'not-dynamic-pattern',
        }}
      >
        <h2>Not Matching Patterns</h2>
      </Card>
    </div>
  )
}
