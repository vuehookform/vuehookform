<template>
  <fieldset class="section">
    <legend class="section__title">Notification Preferences</legend>

    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="notif-email" v-bind="register('notifications.email')" />
        <label for="notif-email">Email notifications</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="notif-push" v-bind="register('notifications.push')" />
        <label for="notif-push">Push notifications</label>
      </div>
    </div>

    <div class="field-group">
      <label class="label">Frequency</label>
      <select class="input" v-bind="register('notifications.frequency')">
        <option value="immediate">Immediate</option>
        <option value="daily">Daily digest</option>
        <option value="weekly">Weekly summary</option>
      </select>
    </div>

    <!-- Show watched value -->
    <div class="watch-indicator">Email notifications: {{ emailEnabled ? 'ON' : 'OFF' }}</div>
  </fieldset>
</template>

<script setup lang="ts">
import { useFormContext } from '../../../lib'
import type { SettingsSchema } from './schema'

// TYPED: Import the schema type from shared file for full autocomplete
const { register, watch } = useFormContext<SettingsSchema>()

// watch() is also typed - only accepts valid paths
const emailEnabled = watch('notifications.email')
</script>

<style scoped>
.section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  background: #fafafa;
}

.section__title {
  color: #42b883;
  font-weight: 600;
  font-size: 1rem;
  padding: 0 0.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.field-group:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-item label {
  cursor: pointer;
  font-size: 0.95rem;
  color: #374151;
}

.watch-indicator {
  padding: 0.5rem 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #15803d;
  margin-top: 0.5rem;
}
</style>
