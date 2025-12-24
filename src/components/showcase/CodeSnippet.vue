<template>
  <div class="code-snippet">
    <div v-if="title || copyable" class="code-snippet__header">
      <span v-if="title" class="code-snippet__title">{{ title }}</span>
      <span class="code-snippet__language">{{ language }}</span>
      <button v-if="copyable" class="code-snippet__copy" @click="copyToClipboard">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <div class="code-snippet__body" :style="{ maxHeight }">
      <pre
        class="code-snippet__pre"
      ><code :class="`language-${language}`"><template v-for="(line, idx) in lines" :key="idx"><span class="code-snippet__line"><span v-if="lineNumbers" class="code-snippet__line-number">{{ idx + 1 }}</span><span class="code-snippet__line-content">{{ line }}</span>
</span></template></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  /** The code to display */
  code: string
  /** Programming language for styling */
  language?: 'typescript' | 'vue' | 'html' | 'json' | 'bash'
  /** Show line numbers */
  lineNumbers?: boolean
  /** Title/filename to display */
  title?: string
  /** Allow copying to clipboard */
  copyable?: boolean
  /** Max height before scrolling */
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
  lineNumbers: true,
  copyable: true,
  maxHeight: '400px',
})

const copied = ref(false)

const lines = computed(() => props.code.trim().split('\n'))

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.code-snippet {
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

.code-snippet__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.code-snippet__title {
  color: #e0e0e0;
  font-size: 0.85rem;
  font-weight: 500;
}

.code-snippet__language {
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-left: auto;
}

.code-snippet__copy {
  padding: 0.25rem 0.75rem;
  background: #3d3d3d;
  border: none;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.code-snippet__copy:hover {
  background: #4d4d4d;
}

.code-snippet__body {
  overflow: auto;
}

.code-snippet__pre {
  margin: 0;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.code-snippet__pre code {
  color: #d4d4d4;
}

.code-snippet__line {
  display: block;
}

.code-snippet__line-number {
  display: inline-block;
  width: 2.5em;
  color: #6e7681;
  text-align: right;
  padding-right: 1em;
  user-select: none;
}

.code-snippet__line-content {
  white-space: pre;
}

/* Basic syntax highlighting classes */
.code-snippet__pre :deep(.keyword) {
  color: #569cd6;
}

.code-snippet__pre :deep(.string) {
  color: #ce9178;
}

.code-snippet__pre :deep(.comment) {
  color: #6a9955;
}

.code-snippet__pre :deep(.function) {
  color: #dcdcaa;
}
</style>
