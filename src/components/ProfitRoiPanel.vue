<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NDivider, NSlider, NText } from 'naive-ui'
import type { useRoiCalculator } from '../composables/useRoiCalculator'
import { formatCurrency } from '../utils/roi'

type Calculator = ReturnType<typeof useRoiCalculator>

const props = defineProps<{ calculator: Calculator }>()

const perOrderGrossProfit = computed(() =>
  props.calculator.profitRoi.value.perOrderGrossProfit,
)

/** 每单净利润滑动模型（范围 0 ~ 每单毛利） */
const netProfitModel = computed<number>({
  get: () => props.calculator.netProfit.value,
  set: (v) => {
    props.calculator.netProfit.value = v ?? 0
  },
})

const perOrderGrossProfitText = computed(() => {
  const v = perOrderGrossProfit.value
  return v === null ? '—' : formatCurrency(v)
})

const requiredRoiText = computed(() => {
  const v = props.calculator.profitRoi.value.requiredRoi
  return v === null ? '—' : formatCurrency(v)
})

const affordableAdCostText = computed(() => {
  const v = props.calculator.profitRoi.value.affordableAdCost
  return v === null ? '—' : formatCurrency(v)
})
</script>

<template>
  <n-card title="净利润 → 所需 ROI（每单）" size="large">
    <div class="field">
      <label>每单净利润（0 ~ {{ perOrderGrossProfitText }}）</label>
      <n-slider
        v-model:value="netProfitModel"
        :min="0"
        :max="perOrderGrossProfit ?? 0"
        :step="1"
        :disabled="perOrderGrossProfit === null"
      />
      <div class="slider-value">当前目标：{{ formatCurrency(netProfitModel) }}</div>
    </div>

    <n-divider />

    <div class="profit-result">
      <div class="row">
        <span class="row-label">每单毛利（扣退货后）</span>
        <span class="row-value">{{ perOrderGrossProfitText }}</span>
      </div>
      <div class="row">
        <span class="row-label">目标每单净利润</span>
        <span class="row-value">{{ formatCurrency(netProfitModel) }}</span>
      </div>
      <div class="row">
        <span class="row-label">每单可投入广告费</span>
        <span class="row-value">{{ affordableAdCostText }}</span>
      </div>
      <div class="row">
        <span class="row-label">所需 ROI（销售额 / 广告费）</span>
        <span class="row-value">{{ requiredRoiText }}</span>
      </div>
    </div>

    <n-text depth="3" class="result-note">
      净利润越高，每单可投入广告费越少、所需 ROI 越高；净利润为 0 时即为保本 ROI
      （可投入广告费 = 每单毛利）。净利润需低于每单毛利才有解。
    </n-text>
  </n-card>
</template>
