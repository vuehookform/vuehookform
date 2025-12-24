<template>
  <ExampleLayout
    title="Conditional Fields"
    description="Show/hide form fields based on other field values using watch(). Clean up hidden fields with unregister() to prevent stale data in submissions."
    :features="['watch() + v-if', 'unregister()', 'Dynamic visibility', 'Clean submissions']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Employment Status -->
        <div class="field-group">
          <label class="field-label">Employment Status *</label>
          <select v-bind="employmentField" class="input">
            <option value="">Select status...</option>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
          <span v-if="getError('employmentStatus')" class="error">
            {{ getError('employmentStatus') }}
          </span>
        </div>

        <!-- Conditional: Employed -->
        <Transition name="slide">
          <div v-if="isEmployed" class="conditional-section employed">
            <h4>Employment Details</h4>
            <FormField name="employer" label="Employer Name" required placeholder="Company Inc." />
            <FormField name="jobTitle" label="Job Title" required placeholder="Software Engineer" />
            <FormField
              name="yearsEmployed"
              label="Years at Company"
              type="number"
              min="0"
              placeholder="2"
            />
          </div>
        </Transition>

        <!-- Conditional: Self-Employed -->
        <Transition name="slide">
          <div v-if="isSelfEmployed" class="conditional-section self-employed">
            <h4>Business Details</h4>
            <FormField
              name="businessName"
              label="Business Name"
              required
              placeholder="My Business LLC"
            />
            <FormField name="businessType" label="Business Type" placeholder="Consulting" />
            <FormField
              name="yearsInBusiness"
              label="Years in Business"
              type="number"
              min="0"
              placeholder="5"
            />
          </div>
        </Transition>

        <!-- Conditional: Student -->
        <Transition name="slide">
          <div v-if="isStudent" class="conditional-section student">
            <h4>Education Details</h4>
            <FormField
              name="schoolName"
              label="School/University"
              required
              placeholder="State University"
            />
            <FormField name="major" label="Major/Field of Study" placeholder="Computer Science" />
            <FormField name="expectedGraduation" label="Expected Graduation" type="date" />
          </div>
        </Transition>

        <!-- Conditional: Retired -->
        <Transition name="slide">
          <div v-if="isRetired" class="conditional-section retired">
            <h4>Retirement Details</h4>
            <FormField
              name="previousEmployer"
              label="Previous Employer"
              placeholder="Former Company"
            />
            <FormField
              name="retirementYear"
              label="Year Retired"
              type="number"
              min="1950"
              :max="new Date().getFullYear()"
              placeholder="2020"
            />
          </div>
        </Transition>

        <!-- Has Vehicle Toggle -->
        <div class="toggle-section">
          <label class="toggle-label">
            <input v-bind="hasVehicleField" type="checkbox" class="toggle-input" />
            <span>Do you own a vehicle?</span>
          </label>
        </div>

        <!-- Conditional: Vehicle Details -->
        <Transition name="slide">
          <div v-if="hasVehicle" class="conditional-section vehicle">
            <h4>Vehicle Details</h4>
            <div class="row">
              <FormField name="vehicleMake" label="Make" required placeholder="Toyota" />
              <FormField name="vehicleModel" label="Model" required placeholder="Camry" />
            </div>
            <FormField
              name="vehicleYear"
              label="Year"
              type="number"
              min="1900"
              :max="new Date().getFullYear() + 1"
              placeholder="2022"
            />
          </div>
        </Transition>

        <!-- Debug Panel -->
        <div class="debug-panel">
          <h4>Submitted Data Preview</h4>
          <pre>{{ JSON.stringify(watchAll, null, 2) }}</pre>
        </div>

        <FormStateDebug :form-state="formState" />
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { computed, watch as vueWatch } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

const schema = z.object({
  employmentStatus: z.enum(['employed', 'self-employed', 'unemployed', 'student', 'retired']),
  // Employed fields
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  yearsEmployed: z.string().optional(),
  // Self-employed fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  yearsInBusiness: z.string().optional(),
  // Student fields
  schoolName: z.string().optional(),
  major: z.string().optional(),
  expectedGraduation: z.string().optional(),
  // Retired fields
  previousEmployer: z.string().optional(),
  retirementYear: z.string().optional(),
  // Vehicle
  hasVehicle: z.boolean().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
})

const form = useForm({
  schema,
  defaultValues: {
    employmentStatus: '' as 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired',
    employer: '',
    jobTitle: '',
    yearsEmployed: '',
    businessName: '',
    businessType: '',
    yearsInBusiness: '',
    schoolName: '',
    major: '',
    expectedGraduation: '',
    previousEmployer: '',
    retirementYear: '',
    hasVehicle: false,
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, register, watch, unregister } = form
const { getError } = useFormErrors(formState)

// Controlled fields for conditional logic
const employmentField = register('employmentStatus', { controlled: true })
const hasVehicleField = register('hasVehicle', { controlled: true })

// Watch employment status
const employmentStatus = watch('employmentStatus')
const hasVehicleWatch = watch('hasVehicle')

// Computed visibility flags
const isEmployed = computed(() => employmentStatus.value === 'employed')
const isSelfEmployed = computed(() => employmentStatus.value === 'self-employed')
const isStudent = computed(() => employmentStatus.value === 'student')
const isRetired = computed(() => employmentStatus.value === 'retired')
const hasVehicle = computed(() => hasVehicleWatch.value === true)

// Watch all for preview
const watchAllRef = watch()
const watchAll = computed(() => watchAllRef.value)

// Cleanup when employment status changes
vueWatch(employmentStatus, (newStatus, oldStatus) => {
  // Unregister fields from previous status
  if (oldStatus === 'employed') {
    unregister('employer')
    unregister('jobTitle')
    unregister('yearsEmployed')
  }
  if (oldStatus === 'self-employed') {
    unregister('businessName')
    unregister('businessType')
    unregister('yearsInBusiness')
  }
  if (oldStatus === 'student') {
    unregister('schoolName')
    unregister('major')
    unregister('expectedGraduation')
  }
  if (oldStatus === 'retired') {
    unregister('previousEmployer')
    unregister('retirementYear')
  }
})

// Cleanup vehicle fields when toggled off
vueWatch(hasVehicleWatch, (hasIt) => {
  if (!hasIt) {
    unregister('vehicleMake')
    unregister('vehicleModel')
    unregister('vehicleYear')
  }
})

const onSubmit = (data: z.infer<typeof schema>) => {
  // Filter out empty optional fields for cleaner output
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
  )
  console.log('Submitted:', cleanData)
  alert('Form submitted! Check console for data.')
}

const codeSnippets = [
  {
    title: 'Watch for Visibility',
    language: 'typescript' as const,
    code: `const { watch } = useForm({ schema })

// Watch a field for conditional rendering
const accountType = watch('accountType')

// In template:
<div v-if="accountType === 'business'">
  <FormField name="companyName" label="Company" />
</div>`,
  },
  {
    title: 'Unregister Cleanup',
    language: 'typescript' as const,
    code: `import { watch as vueWatch } from 'vue'

const { watch, unregister } = useForm({ schema })
const accountType = watch('accountType')

// Clean up hidden fields when type changes
vueWatch(accountType, (newType, oldType) => {
  if (oldType === 'business') {
    // Remove business fields from form data
    unregister('companyName')
    unregister('taxId')
  }
  if (oldType === 'personal') {
    unregister('ssn')
  }
})`,
  },
  {
    title: 'Why Unregister?',
    language: 'typescript' as const,
    code: `// Without unregister():
// - Hidden field values remain in form data
// - Submit includes stale/irrelevant data
// - Memory not released for field refs

// With unregister():
// - Clean form data on submit
// - Only visible fields included
// - Proper memory cleanup

// Note: Re-registering a field will
// reset it to defaultValue`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #42b883;
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.conditional-section {
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.conditional-section h4 {
  margin: 0 0 1rem 0;
}

.conditional-section.employed {
  background: #e3f2fd;
  border-color: #2196f3;
}

.conditional-section.employed h4 {
  color: #1565c0;
}

.conditional-section.self-employed {
  background: #f3e5f5;
  border-color: #9c27b0;
}

.conditional-section.self-employed h4 {
  color: #7b1fa2;
}

.conditional-section.student {
  background: #fff3e0;
  border-color: #ff9800;
}

.conditional-section.student h4 {
  color: #e65100;
}

.conditional-section.retired {
  background: #e8f5e9;
  border-color: #4caf50;
}

.conditional-section.retired h4 {
  color: #2e7d32;
}

.conditional-section.vehicle {
  background: #fce4ec;
  border-color: #e91e63;
}

.conditional-section.vehicle h4 {
  color: #c2185b;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.toggle-section {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.toggle-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.debug-panel {
  padding: 1rem;
  background: #1e1e1e;
  border-radius: 8px;
  color: #d4d4d4;
}

.debug-panel h4 {
  margin: 0 0 0.5rem 0;
  color: #42b883;
  font-size: 0.9rem;
}

.debug-panel pre {
  margin: 0;
  font-size: 0.75rem;
  max-height: 200px;
  overflow: auto;
}

.submit-btn {
  padding: 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover {
  background: #35a372;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
}
</style>
