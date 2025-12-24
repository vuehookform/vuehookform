<template>
  <ExampleLayout
    title="Dependent Dropdowns"
    description="Build cascading select fields that update based on parent selections. Use watch() to detect changes and setValue() to update dependent fields."
    :features="['watch() + setValue()', 'Cascading selects', 'API integration', 'Loading states']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <!-- Country Select -->
        <div class="field-group">
          <label class="field-label">Country *</label>
          <div class="select-wrapper">
            <select v-bind="countryField" class="select" :disabled="loadingCountries">
              <option value="">{{ loadingCountries ? 'Loading...' : 'Select a country' }}</option>
              <option v-for="country in countries" :key="country.code" :value="country.code">
                {{ country.name }}
              </option>
            </select>
          </div>
          <span v-if="getError('country')" class="error">{{ getError('country') }}</span>
        </div>

        <!-- State Select -->
        <div class="field-group">
          <label class="field-label">State/Province *</label>
          <div class="select-wrapper">
            <select
              v-bind="stateField"
              class="select"
              :disabled="!selectedCountry || loadingStates"
            >
              <option value="">
                {{
                  loadingStates
                    ? 'Loading...'
                    : !selectedCountry
                      ? 'Select a country first'
                      : 'Select a state'
                }}
              </option>
              <option v-for="state in states" :key="state.code" :value="state.code">
                {{ state.name }}
              </option>
            </select>
            <span v-if="loadingStates" class="loading-indicator" />
          </div>
          <span v-if="getError('state')" class="error">{{ getError('state') }}</span>
        </div>

        <!-- City Select -->
        <div class="field-group">
          <label class="field-label">City *</label>
          <div class="select-wrapper">
            <select v-bind="cityField" class="select" :disabled="!selectedState || loadingCities">
              <option value="">
                {{
                  loadingCities
                    ? 'Loading...'
                    : !selectedState
                      ? 'Select a state first'
                      : 'Select a city'
                }}
              </option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
            <span v-if="loadingCities" class="loading-indicator" />
          </div>
          <span v-if="getError('city')" class="error">{{ getError('city') }}</span>
        </div>

        <!-- Selected Location Display -->
        <div v-if="selectedCity" class="selected-location">
          <h4>Selected Location</h4>
          <div class="location-details">
            <span class="location-icon">location</span>
            <span>{{ selectedCity }}, {{ selectedState }}, {{ selectedCountry }}</span>
          </div>
        </div>

        <FormField name="zipCode" label="Zip/Postal Code" required placeholder="10001" />

        <FormStateDebug :form-state="formState" />
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch as vueWatch } from 'vue'
import { useForm } from '../../lib'
import { FormProvider, FormField, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

// Simulated data
const countryData = {
  US: {
    name: 'United States',
    states: {
      CA: { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'] },
      NY: { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany'] },
      TX: { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio'] },
      FL: { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] },
    },
  },
  CA: {
    name: 'Canada',
    states: {
      ON: { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'] },
      BC: { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Burnaby', 'Surrey'] },
      QC: { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'] },
    },
  },
  UK: {
    name: 'United Kingdom',
    states: {
      ENG: { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool'] },
      SCT: { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'] },
      WLS: { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham'] },
    },
  },
}

// API simulation functions
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchCountries() {
  await simulateDelay(500)
  return Object.entries(countryData).map(([code, data]) => ({
    code,
    name: data.name,
  }))
}

async function fetchStates(countryCode: string) {
  await simulateDelay(400)
  const country = countryData[countryCode as keyof typeof countryData]
  if (!country) return []
  return Object.entries(country.states).map(([code, data]) => ({
    code,
    name: data.name,
  }))
}

async function fetchCities(countryCode: string, stateCode: string) {
  await simulateDelay(300)
  const country = countryData[countryCode as keyof typeof countryData]
  if (!country) return []
  const states = country.states as Record<string, { name: string; cities: string[] }>
  const state = states[stateCode]
  return state?.cities || []
}

// Schema
const schema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
})

const form = useForm({
  schema,
  defaultValues: {
    country: '',
    state: '',
    city: '',
    zipCode: '',
  },
  mode: 'onBlur',
})

const { handleSubmit, formState, register, watch, setValue } = form
const { getError } = useFormErrors(formState)

// Controlled selects
const countryField = register('country', { controlled: true })
const stateField = register('state', { controlled: true })
const cityField = register('city', { controlled: true })

// Watch selections
const selectedCountry = computed(() => (watch('country').value as string) || '')
const selectedState = computed(() => (watch('state').value as string) || '')
const selectedCity = computed(() => (watch('city').value as string) || '')

// Loading states
const loadingCountries = ref(true)
const loadingStates = ref(false)
const loadingCities = ref(false)

// Options
const countries = ref<{ code: string; name: string }[]>([])
const states = ref<{ code: string; name: string }[]>([])
const cities = ref<string[]>([])

// Load countries on mount
;(async () => {
  countries.value = await fetchCountries()
  loadingCountries.value = false
})()

// Watch country changes to load states
vueWatch(selectedCountry, async (newCountry) => {
  // Clear dependent fields
  setValue('state', '')
  setValue('city', '')
  states.value = []
  cities.value = []

  if (newCountry) {
    loadingStates.value = true
    states.value = await fetchStates(newCountry)
    loadingStates.value = false
  }
})

// Watch state changes to load cities
vueWatch(selectedState, async (newState) => {
  // Clear city
  setValue('city', '')
  cities.value = []

  if (newState && selectedCountry.value) {
    loadingCities.value = true
    cities.value = await fetchCities(selectedCountry.value, newState)
    loadingCities.value = false
  }
})

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Submitted:', data)
  alert(`Location saved: ${data.city}, ${data.state}, ${data.country}`)
}

const codeSnippets = [
  {
    title: 'Watch Parent Changes',
    language: 'typescript' as const,
    code: `import { watch as vueWatch } from 'vue'

const { watch, setValue } = useForm({ schema })

const selectedCountry = watch('country')

// When country changes, load states
vueWatch(selectedCountry, async (newCountry) => {
  // Clear dependent fields
  setValue('state', '')
  setValue('city', '')

  if (newCountry) {
    states.value = await fetchStates(newCountry)
  }
})`,
  },
  {
    title: 'Loading States',
    language: 'typescript' as const,
    code: `const loadingStates = ref(false)

vueWatch(selectedCountry, async (country) => {
  if (country) {
    loadingStates.value = true
    try {
      states.value = await fetchStates(country)
    } finally {
      loadingStates.value = false
    }
  }
})

// In template:
<select :disabled="!selectedCountry || loadingStates">
  <option v-if="loadingStates">Loading...</option>
</select>`,
  },
  {
    title: 'Controlled Selects',
    language: 'typescript' as const,
    code: `// Use controlled mode for reactive updates
const countryField = register('country', { controlled: true })
const stateField = register('state', { controlled: true })

// The watch() values update immediately
// setValue() clears dependent selections`,
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

.select-wrapper {
  position: relative;
}

.select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select:focus {
  outline: none;
  border-color: #42b883;
}

.select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.error {
  color: #e74c3c;
  font-size: 0.85rem;
}

.selected-location {
  padding: 1rem;
  background: #e8f5e9;
  border-radius: 8px;
}

.selected-location h4 {
  margin: 0 0 0.5rem 0;
  color: #2e7d32;
  font-size: 0.9rem;
}

.location-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1b5e20;
  font-weight: 500;
}

.location-icon {
  font-size: 1.25rem;
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
</style>
