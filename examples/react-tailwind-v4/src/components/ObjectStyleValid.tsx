import React from 'react'

/**
 * ObjectStyleValid - Demonstrates valid object-style class name syntax
 *
 * This component shows how to use object-style class name props like:
 * - classes={{ root: 'mt-2', container: 'p-4' }}
 * - classNames={{ header: 'flex', body: 'p-4' }}
 *
 * Common in component libraries like Material-UI, Chakra UI, Mantine, etc.
 * These patterns allow styling of nested sub-components within a parent component.
 */

// Mock Card component that accepts classes prop
interface CardProps {
  className?: string
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

const Card: React.FC<CardProps> = ({ className, classes, children }) => {
  return (
    <div className={className || classes?.root}>
      <div className={classes?.header}>{children}</div>
    </div>
  )
}

export const ObjectStyleValid: React.FC = () => {
  const isActive = true

  return (
    <div className="container">
      {/* Basic object literal with valid classes */}
      <Card
        classes={{
          root: 'card',
          header: 'flex items-center',
          body: 'p-4',
        }}
      >
        <h2>Card with Object-Style Classes</h2>
      </Card>

      {/* Object with conditional expressions */}
      <Card
        classes={{
          root: isActive ? 'bg-blue-500' : 'bg-gray-500',
          header: 'text-white',
        }}
      >
        <h2>Conditional Classes</h2>
      </Card>

      {/* Object with logical expressions */}
      <Card
        classes={{
          root: 'card',
          header: isActive && 'flex items-center',
          body: 'p-4',
        }}
      >
        <h2>Logical Expression Classes</h2>
      </Card>

      {/* Multiple object properties with space-separated classes */}
      <Card
        classes={{
          root: 'card rounded',
          header: 'flex items-center justify-between gap-4',
          body: 'p-4 bg-blue-500 text-white',
          footer: 'button-primary',
        }}
      >
        <h2>Multiple Classes per Property</h2>
      </Card>

      {/* Using classNames attribute (alternative naming) */}
      <Card
        classNames={{
          container: 'container mb-2',
          title: 'text-brand-500',
        }}
      >
        <h2>Using classNames Attribute</h2>
      </Card>

      {/* Mix of className and object-style attributes */}
      <Card
        className="main-content"
        classes={{
          root: 'card',
          header: 'header flex',
        }}
      >
        <h2>Mixed Attributes</h2>
      </Card>

      {/* Using whitelist patterns */}
      <Card
        classes={{
          root: 'custom-widget',
          header: 'custom-header',
        }}
      >
        <h2>Custom Classes (Whitelist)</h2>
      </Card>

      {/* Using ignored patterns - won't error even if not defined */}
      <Card
        classes={{
          root: 'dynamic-loader',
          header: 'dynamic-header',
        }}
      >
        <h2>Dynamic Classes (Ignored)</h2>
      </Card>
    </div>
  )
}
