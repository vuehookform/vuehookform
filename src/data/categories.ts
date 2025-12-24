import type { Component } from 'vue'

export interface Example {
  id: string
  name: string
  component: () => Promise<{ default: Component }>
}

export interface Category {
  id: string
  label: string
  description: string
  examples: Example[]
}

export const categories: Category[] = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Get started with form registration, validation, and submission',
    examples: [
      {
        id: 'plain-form',
        name: 'Plain Form (No Wrappers)',
        component: () => import('@/examples/01-basics/PlainForm.vue'),
      },
      {
        id: 'basic-form',
        name: 'Basic Form',
        component: () => import('@/examples/01-basics/BasicForm.vue'),
      },
      {
        id: 'validation-modes',
        name: 'Validation Modes',
        component: () => import('@/examples/01-basics/ValidationModes.vue'),
      },
      {
        id: 'controlled-inputs',
        name: 'Controlled Inputs',
        component: () => import('@/examples/01-basics/ControlledInputs.vue'),
      },
    ],
  },
  {
    id: 'programmatic',
    label: 'Programmatic',
    description: 'Control form values and validation programmatically',
    examples: [
      {
        id: 'set-get-values',
        name: 'Set & Get Values',
        component: () => import('@/examples/02-programmatic/SetGetValues.vue'),
      },
      {
        id: 'form-reset',
        name: 'Form Reset',
        component: () => import('@/examples/02-programmatic/FormReset.vue'),
      },
      {
        id: 'watch-fields',
        name: 'Watch Fields',
        component: () => import('@/examples/02-programmatic/WatchFields.vue'),
      },
      {
        id: 'manual-validation',
        name: 'Manual Validation',
        component: () => import('@/examples/02-programmatic/ManualValidation.vue'),
      },
    ],
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Custom validation, async checks, and cross-field rules',
    examples: [
      {
        id: 'custom-validation',
        name: 'Custom Validation',
        component: () => import('@/examples/03-validation/CustomValidation.vue'),
      },
      {
        id: 'async-validation',
        name: 'Async Validation',
        component: () => import('@/examples/03-validation/AsyncValidation.vue'),
      },
      {
        id: 'cross-field',
        name: 'Cross-Field Validation',
        component: () => import('@/examples/03-validation/CrossFieldValidation.vue'),
      },
    ],
  },
  {
    id: 'dynamic',
    label: 'Dynamic Fields',
    description: 'Dynamic arrays, conditional rendering, and field cleanup',
    examples: [
      {
        id: 'dynamic-arrays',
        name: 'Dynamic Arrays',
        component: () => import('@/examples/04-dynamic/DynamicArrays.vue'),
      },
      {
        id: 'array-operations',
        name: 'Array Operations',
        component: () => import('@/examples/04-dynamic/ArrayOperations.vue'),
      },
      {
        id: 'conditional-fields',
        name: 'Conditional Fields',
        component: () => import('@/examples/04-dynamic/ConditionalFields.vue'),
      },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Complex patterns for nested objects, wizards, and dependent fields',
    examples: [
      {
        id: 'nested-objects',
        name: 'Nested Objects',
        component: () => import('@/examples/05-advanced/NestedObjects.vue'),
      },
      {
        id: 'multi-step',
        name: 'Multi-Step Form',
        component: () => import('@/examples/05-advanced/MultiStepForm.vue'),
      },
      {
        id: 'dependent-dropdowns',
        name: 'Dependent Dropdowns',
        component: () => import('@/examples/05-advanced/DependentDropdowns.vue'),
      },
    ],
  },
  {
    id: 'realworld',
    label: 'Real World',
    description: 'Production-ready patterns and complete form examples',
    examples: [
      {
        id: 'login-register',
        name: 'Login & Register',
        component: () => import('@/examples/06-realworld/LoginRegister.vue'),
      },
      {
        id: 'invoice-form',
        name: 'Invoice Form',
        component: () => import('@/examples/06-realworld/InvoiceForm.vue'),
      },
      {
        id: 'search-filters',
        name: 'Search & Filters',
        component: () => import('@/examples/06-realworld/SearchFilters.vue'),
      },
    ],
  },
  {
    id: 'context',
    label: 'Form Context',
    description: 'Share form state across components with provideForm() and useFormContext()',
    examples: [
      {
        id: 'basic-context',
        name: 'Basic Context',
        component: () => import('@/examples/07-context/BasicContext/BasicContextDemo.vue'),
      },
      {
        id: 'reusable-form-field',
        name: 'Reusable Form Field',
        component: () => import('@/examples/07-context/ReusableFormField/ReusableFieldDemo.vue'),
      },
      {
        id: 'nested-components',
        name: 'Nested Components',
        component: () => import('@/examples/07-context/NestedComponents/NestedComponentsDemo.vue'),
      },
      {
        id: 'multiple-forms',
        name: 'Multiple Forms',
        component: () => import('@/examples/07-context/MultipleForms/MultipleFormsDemo.vue'),
      },
      {
        id: 'typed-context',
        name: 'TypeScript Integration',
        component: () => import('@/examples/07-context/TypedContext/TypedContextDemo.vue'),
      },
    ],
  },
]

export function findCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export function findExampleById(categoryId: string, exampleId: string): Example | undefined {
  const category = findCategoryById(categoryId)
  return category?.examples.find((e) => e.id === exampleId)
}

export function getDefaultRoute(): { category: string; example: string } {
  return {
    category: categories[0]!.id,
    example: categories[0]!.examples[0]!.id,
  }
}

export const totalExamples = categories.reduce((sum, cat) => sum + cat.examples.length, 0)
