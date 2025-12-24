<template>
  <ExampleLayout
    title="Array Operations"
    description="Explore all field array operations: append, remove, insert, swap, and move. Build reorderable lists with full control over item positions."
    :features="['insert()', 'swap()', 'move()', 'Reorderable lists']"
    :code-snippets="codeSnippets"
  >
    <FormProvider :form="form">
      <form @submit.prevent="handleSubmit(onSubmit)" class="form">
        <div class="array-section">
          <div class="section-header">
            <h3>Task List</h3>
            <button type="button" @click="addTask" class="add-btn">+ Add Task</button>
          </div>

          <div v-if="taskFields.value.length === 0" class="empty-state">
            No tasks yet. Click "Add Task" to get started.
          </div>

          <TransitionGroup name="list" tag="div" class="task-list">
            <div v-for="(field, idx) in taskFields.value" :key="field.key" class="task-card">
              <div class="task-handle">
                <span class="task-number">{{ idx + 1 }}</span>
              </div>

              <div class="task-content">
                <input
                  v-bind="register(`tasks.${idx}.title`)"
                  placeholder="Task title..."
                  class="task-input"
                />
                <select v-bind="register(`tasks.${idx}.priority`)" class="priority-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div class="task-actions">
                <!-- Move Up -->
                <button
                  type="button"
                  @click="moveUp(idx)"
                  :disabled="idx === 0"
                  class="action-btn"
                  title="Move up"
                >
                  ^
                </button>

                <!-- Move Down -->
                <button
                  type="button"
                  @click="moveDown(idx)"
                  :disabled="idx === taskFields.value.length - 1"
                  class="action-btn"
                  title="Move down"
                >
                  v
                </button>

                <!-- Insert After -->
                <button
                  type="button"
                  @click="insertAfter(idx)"
                  class="action-btn insert"
                  title="Insert task after"
                >
                  +
                </button>

                <!-- Remove -->
                <button
                  type="button"
                  @click="field.remove()"
                  class="action-btn remove"
                  title="Remove task"
                >
                  x
                </button>
              </div>
            </div>
          </TransitionGroup>

          <!-- Bulk Operations -->
          <div v-if="taskFields.value.length >= 2" class="bulk-operations">
            <h4>Bulk Operations</h4>
            <div class="bulk-buttons">
              <button type="button" @click="reverseAll" class="bulk-btn">Reverse All</button>
              <button type="button" @click="swapFirstLast" class="bulk-btn">
                Swap First & Last
              </button>
              <button type="button" @click="moveLastToFirst" class="bulk-btn">
                Move Last to First
              </button>
            </div>
          </div>
        </div>

        <FormStateDebug :form-state="formState" />
        <button type="submit" class="submit-btn">Save Tasks</button>
      </form>
    </FormProvider>
  </ExampleLayout>
</template>

<script setup lang="ts">
import { useForm } from '../../lib'
import { FormProvider, FormStateDebug } from '../../components/form'
import { ExampleLayout } from '../../components/showcase'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['low', 'medium', 'high']),
})

const schema = z.object({
  tasks: z.array(taskSchema),
})

const form = useForm({
  schema,
  defaultValues: {
    tasks: [
      { title: 'Learn Vue Hook Form', priority: 'high' as const },
      { title: 'Build awesome forms', priority: 'medium' as const },
      { title: 'Ship to production', priority: 'low' as const },
    ],
  },
  mode: 'onSubmit',
})

const { register, handleSubmit, formState, fields } = form

const taskFields = fields('tasks')

// Add new task at end
function addTask() {
  taskFields.append({ title: '', priority: 'medium' })
}

// Insert after specific index
function insertAfter(index: number) {
  taskFields.insert(index + 1, { title: '', priority: 'medium' })
}

// Move up (swap with previous)
function moveUp(index: number) {
  if (index > 0) {
    taskFields.swap(index, index - 1)
  }
}

// Move down (swap with next)
function moveDown(index: number) {
  if (index < taskFields.value.length - 1) {
    taskFields.swap(index, index + 1)
  }
}

// Bulk: Reverse all items
function reverseAll() {
  const len = taskFields.value.length
  for (let i = 0; i < Math.floor(len / 2); i++) {
    taskFields.swap(i, len - 1 - i)
  }
}

// Bulk: Swap first and last
function swapFirstLast() {
  if (taskFields.value.length >= 2) {
    taskFields.swap(0, taskFields.value.length - 1)
  }
}

// Bulk: Move last item to first position
function moveLastToFirst() {
  if (taskFields.value.length >= 2) {
    taskFields.move(taskFields.value.length - 1, 0)
  }
}

const onSubmit = (data: z.infer<typeof schema>) => {
  console.log('Tasks:', data.tasks)
  alert(`Saved ${data.tasks.length} tasks!`)
}

const codeSnippets = [
  {
    title: 'All Operations',
    language: 'typescript' as const,
    code: `const taskFields = fields('tasks')

// Append - add to end
taskFields.append({ title: '', priority: 'medium' })

// Remove - remove at index
taskFields.remove(2)

// Insert - add at specific position
taskFields.insert(1, { title: 'New task', priority: 'high' })

// Swap - exchange two items
taskFields.swap(0, 2) // Swap first and third

// Move - relocate item to new position
taskFields.move(3, 0) // Move 4th item to first position`,
  },
  {
    title: 'Reorder Pattern',
    language: 'typescript' as const,
    code: `// Move up (swap with previous)
function moveUp(index: number) {
  if (index > 0) {
    taskFields.swap(index, index - 1)
  }
}

// Move down (swap with next)
function moveDown(index: number) {
  if (index < taskFields.value.length - 1) {
    taskFields.swap(index, index + 1)
  }
}

// For drag-and-drop, use move()
function onDragEnd(fromIndex: number, toIndex: number) {
  taskFields.move(fromIndex, toIndex)
}`,
  },
  {
    title: 'Bulk Operations',
    language: 'typescript' as const,
    code: `// Reverse entire array
function reverseAll() {
  const len = taskFields.value.length
  for (let i = 0; i < Math.floor(len / 2); i++) {
    taskFields.swap(i, len - 1 - i)
  }
}

// Note: Each operation triggers validation if mode is 'onChange'
// and marks the form as dirty`,
  },
]
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.array-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.add-btn:hover {
  background: #35a372;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #888;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.task-card:hover {
  border-color: #42b883;
}

.task-handle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #42b883;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.85rem;
}

.task-number {
  line-height: 1;
}

.task-content {
  flex: 1;
  display: flex;
  gap: 0.75rem;
}

.task-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.task-input:focus {
  outline: none;
  border-color: #42b883;
}

.priority-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.insert {
  color: #42b883;
  border-color: #42b883;
}

.action-btn.insert:hover {
  background: #42b883;
  color: white;
}

.action-btn.remove {
  color: #e74c3c;
  border-color: #e74c3c;
}

.action-btn.remove:hover {
  background: #e74c3c;
  color: white;
}

.bulk-operations {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.bulk-operations h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #666;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.bulk-btn:hover {
  background: #5a67d8;
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

/* Transition animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
