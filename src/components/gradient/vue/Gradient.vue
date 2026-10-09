<script setup lang="ts">
import '../gradient.css';
import { gradientVars, type GradientProps } from '../gradient.props';

const props = defineProps<GradientProps>();
</script>

<template>
  <div class="gradient" aria-hidden="true" :style="gradientVars(props)" />
</template>
