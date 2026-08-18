<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NText } from 'naive-ui'
import type { useRoiCalculator } from '../composables/useRoiCalculator'
import { formatCurrency, formatPercent } from '../utils/roi'

type Calculator = ReturnType<typeof useRoiCalculator>

const props = defineProps<{ calculator: Calculator }>()

const stats = computed(() => {
  const roi = props.calculator.breakEvenRoi.value
  return [
    {
      label: '毛利率 g（不含广告费）',
      value: formatPercent(props.calculator.grossMargin.value),
    },
    {
      label: '保本 ROI（销售额 / 广告费倍数）',
      value: roi === null ? '—' : formatCurrency(roi),
    },
  ]
})
</script>

<template>
  <n-card title="计算结果" size="large">
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
      </div>
    </div>
    <n-text depth="3" class="result-note">
      保本 ROI = 1 ÷ (g × (1 − 退货率))，即每投入 1 元广告费至少需带来的销售额倍数，
      达到该值即可保本。
    </n-text>
  </n-card>
</template>
