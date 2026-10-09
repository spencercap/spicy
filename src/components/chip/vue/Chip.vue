<script setup lang="ts">
import '../chip.css';
import type { ChipProps } from '../chip.props';

const props = withDefaults(defineProps<ChipProps>(), { label: 'Chip', count: 0, color: '#e4572e' });
</script>

<template>
  <span class="chip" :style="{ '--chip-color': props.color }">
    <span class="label">{{ props.label }}</span>
    <span class="count">{{ props.count }}</span>
  </span>
</template>
