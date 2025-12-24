<template>
  <ExampleLayout
    title="Search & Filters"
    description="A real-time search and filter form using onChange mode. Features debounced search, filter presets, and instant feedback without a submit button."
    :features="['mode: onChange', 'Debounced search', 'Filter presets', 'No submit button']"
    :code-snippets="codeSnippets"
  >
    <div class="search-container">
      <FormProvider :form="form">
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">Q</span>
          <input
            v-bind="register('query')"
            type="search"
            placeholder="Search products..."
            class="search-input"
          />
          <span v-if="searching" class="searching-indicator">Searching...</span>
        </div>

        <div class="main-content">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar">
            <div class="filters-header">
              <h3>Filters</h3>
              <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
              <button type="button" @click="clearFilters" class="clear-filters">Clear All</button>
            </div>

            <!-- Quick Presets -->
            <div class="preset-section">
              <h4>Quick Filters</h4>
              <div class="preset-buttons">
                <button type="button" @click="applyPreset('budget')" class="preset-btn">
                  Budget Friendly
                </button>
                <button type="button" @click="applyPreset('premium')" class="preset-btn">
                  Premium
                </button>
                <button type="button" @click="applyPreset('topRated')" class="preset-btn">
                  Top Rated
                </button>
              </div>
            </div>

            <!-- Category -->
            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select v-bind="register('category')" class="filter-select">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <label class="filter-label">Price Range</label>
              <div class="price-range">
                <div class="price-input">
                  <span>$</span>
                  <input v-bind="register('priceMin')" type="number" min="0" placeholder="Min" />
                </div>
                <span class="price-separator">to</span>
                <div class="price-input">
                  <span>$</span>
                  <input v-bind="register('priceMax')" type="number" min="0" placeholder="Max" />
                </div>
              </div>
              <span v-if="getError('priceMax')" class="error">{{ getError('priceMax') }}</span>
            </div>

            <!-- Rating -->
            <div class="filter-group">
              <label class="filter-label">Minimum Rating</label>
              <div class="rating-filter">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="setRating(star)"
                  :class="['rating-btn', { active: (ratingValue as number) >= star }]"
                >
                  *
                </button>
                <span class="rating-label">{{ ratingValue || 'Any' }}</span>
              </div>
            </div>

            <!-- In Stock -->
            <div class="filter-group">
              <label class="filter-checkbox">
                <input v-bind="register('inStock')" type="checkbox" />
                <span>In Stock Only</span>
              </label>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-label">Sort By</label>
              <select v-bind="register('sortBy')" class="filter-select">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </aside>

          <!-- Results Area -->
          <main class="results-area">
            <div class="results-header">
              <span class="results-count">
                {{ searching ? 'Searching...' : `${results.length} results found` }}
              </span>
              <span v-if="searchQuery" class="search-query"> for "{{ searchQuery }}" </span>
            </div>

            <!-- Mock Results -->
            <div class="results-grid">
              <div v-for="result in results" :key="result.id" class="result-card">
                <div class="result-image" :style="{ background: result.color }" />
                <div class="result-info">
                  <h4>{{ result.name }}</h4>
                  <div class="result-meta">
                    <span class="result-price">${{ result.price }}</span>
                    <span class="result-rating">* {{ result.rating }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="results.length === 0 && !searching" class="no-results">
              No products found matching your criteria.
            </div>
          </main>
        </div>
      </FormProvider>
    </div>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch as vueWatch } from 'vue'
import { useForm } from '../../lib'
import { FormProvider } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { useFormErrors } from '../../composables'
import { z } from 'zod'

// Mock data
const allProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    rating: 4.5,
    category: 'electronics',
    color: '#667eea',
  },
  {
    id: 2,
    name: 'Running Shoes',
    price: 129.99,
    rating: 4.8,
    category: 'sports',
    color: '#42b883',
  },
  { id: 3, name: 'Coffee Maker', price: 49.99, rating: 4.2, category: 'home', color: '#ff9800' },
  {
    id: 4,
    name: 'Leather Jacket',
    price: 299.99,
    rating: 4.7,
    category: 'clothing',
    color: '#e91e63',
  },
  {
    id: 5,
    name: 'Smart Watch',
    price: 199.99,
    rating: 4.6,
    category: 'electronics',
    color: '#9c27b0',
  },
  { id: 6, name: 'Yoga Mat', price: 29.99, rating: 4.4, category: 'sports', color: '#00bcd4' },
  { id: 7, name: 'Plant Pot Set', price: 34.99, rating: 4.1, category: 'home', color: '#8bc34a' },
  { id: 8, name: 'Denim Jeans', price: 89.99, rating: 4.3, category: 'clothing', color: '#3f51b5' },
]

const schema = z
  .object({
    query: z.string().optional(),
    category: z.string().optional(),
    priceMin: z.string().optional(),
    priceMax: z.string().optional(),
    rating: z.number().optional(),
    inStock: z.boolean().optional(),
    sortBy: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.priceMin && data.priceMax) {
        return parseFloat(data.priceMax) >= parseFloat(data.priceMin)
      }
      return true
    },
    {
      message: 'Max must be >= Min',
      path: ['priceMax'],
    },
  )

const form = useForm({
  schema,
  defaultValues: {
    query: '',
    category: '',
    priceMin: '',
    priceMax: '',
    rating: undefined as number | undefined,
    inStock: false,
    sortBy: 'relevance',
  },
  mode: 'onChange', // Real-time validation
})

const { register, formState, watch, setValue, reset } = form
const { getError } = useFormErrors(formState)

const searching = ref(false)
const results = ref(allProducts)

// Watch all filters
const queryWatch = watch('query')
const categoryWatch = watch('category')
const priceMinWatch = watch('priceMin')
const priceMaxWatch = watch('priceMax')
const ratingWatch = watch('rating')
const inStockWatch = watch('inStock')
const sortByWatch = watch('sortBy')

const searchQuery = computed(() => (queryWatch.value as string) || '')
const ratingValue = computed(() => ratingWatch.value)

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (queryWatch.value) count++
  if (categoryWatch.value) count++
  if (priceMinWatch.value || priceMaxWatch.value) count++
  if (ratingWatch.value) count++
  if (inStockWatch.value) count++
  if (sortByWatch.value && sortByWatch.value !== 'relevance') count++
  return count
})

// Debounced search
let searchTimeout: number
vueWatch(
  [queryWatch, categoryWatch, priceMinWatch, priceMaxWatch, ratingWatch, inStockWatch, sortByWatch],
  () => {
    searching.value = true
    clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
      filterResults()
      searching.value = false
    }, 300)
  },
)

function filterResults() {
  let filtered = [...allProducts]

  // Query filter
  const query = (queryWatch.value as string)?.toLowerCase()
  if (query) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
  }

  // Category filter
  const category = categoryWatch.value as string
  if (category) {
    filtered = filtered.filter((p) => p.category === category)
  }

  // Price range
  const minPrice = parseFloat(priceMinWatch.value as string)
  const maxPrice = parseFloat(priceMaxWatch.value as string)
  if (!isNaN(minPrice)) {
    filtered = filtered.filter((p) => p.price >= minPrice)
  }
  if (!isNaN(maxPrice)) {
    filtered = filtered.filter((p) => p.price <= maxPrice)
  }

  // Rating filter
  const rating = ratingWatch.value as number
  if (rating) {
    filtered = filtered.filter((p) => p.rating >= rating)
  }

  // Sort
  const sortBy = sortByWatch.value as string
  switch (sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
  }

  results.value = filtered
}

function setRating(star: number) {
  const current = ratingWatch.value as number
  setValue('rating', current === star ? (undefined as number | undefined) : star)
}

function clearFilters() {
  reset()
  results.value = allProducts
}

function applyPreset(preset: 'budget' | 'premium' | 'topRated') {
  clearFilters()

  switch (preset) {
    case 'budget':
      setValue('priceMax', '50')
      setValue('sortBy', 'price_asc')
      break
    case 'premium':
      setValue('priceMin', '100')
      setValue('sortBy', 'price_desc')
      break
    case 'topRated':
      setValue('rating', 4)
      setValue('sortBy', 'rating')
      break
  }
}

const codeSnippets = [
  {
    title: 'onChange Mode',
    language: 'typescript' as const,
    code: `const form = useForm({
  schema,
  defaultValues: { query: '', category: '', ... },
  mode: 'onChange' // Validate on every change
})

// No submit button needed!
// Results update automatically as user types/selects`,
  },
  {
    title: 'Debounced Search',
    language: 'typescript' as const,
    code: `import { watch as vueWatch } from 'vue'

const queryWatch = watch('query')
let timeout: number

vueWatch(queryWatch, () => {
  searching.value = true
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    performSearch()
    searching.value = false
  }, 300) // 300ms debounce
})`,
  },
  {
    title: 'Filter Presets',
    language: 'typescript' as const,
    code: `function applyPreset(preset: string) {
  reset() // Clear existing filters

  switch (preset) {
    case 'budget':
      setValue('priceMax', '50')
      setValue('sortBy', 'price_asc')
      break
    case 'premium':
      setValue('priceMin', '100')
      break
    case 'topRated':
      setValue('rating', 4)
      setValue('sortBy', 'rating')
      break
  }
}`,
  },
]
</script>

<style scoped>
.search-container {
  max-width: 1000px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.search-icon {
  color: #888;
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  padding: 1rem 0;
  border: none;
  font-size: 1rem;
  outline: none;
}

.searching-indicator {
  color: #ff9800;
  font-size: 0.85rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
}

.filters-sidebar {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  margin: 0;
  color: #2c3e50;
}

.filter-badge {
  background: #42b883;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.clear-filters {
  margin-left: auto;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 0.8rem;
  cursor: pointer;
}

.preset-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.preset-section h4 {
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.85rem;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-btn {
  padding: 0.4rem 0.75rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.preset-btn:hover {
  background: #e8f5e9;
  border-color: #42b883;
}

.filter-group {
  margin-bottom: 1.25rem;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.price-input span {
  padding: 0.5rem;
  background: #f5f5f5;
  color: #666;
}

.price-input input {
  width: 60px;
  padding: 0.5rem;
  border: none;
}

.price-separator {
  color: #888;
}

.error {
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.rating-filter {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: #ccc;
  font-size: 1rem;
}

.rating-btn.active {
  background: #fff3e0;
  border-color: #ff9800;
  color: #ff9800;
}

.rating-label {
  margin-left: 0.5rem;
  color: #666;
  font-size: 0.85rem;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-checkbox input {
  width: 16px;
  height: 16px;
}

.results-area {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.results-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.results-count {
  font-weight: 600;
  color: #2c3e50;
}

.search-query {
  color: #666;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.result-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.result-image {
  height: 80px;
}

.result-info {
  padding: 0.75rem;
}

.result-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
}

.result-meta {
  display: flex;
  justify-content: space-between;
}

.result-price {
  font-weight: 600;
  color: #42b883;
}

.result-rating {
  color: #ff9800;
  font-size: 0.85rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #888;
}
</style>
