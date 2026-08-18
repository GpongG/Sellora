<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NInputNumber } from 'naive-ui'
import type { useRoiCalculator } from '../composables/useRoiCalculator'

type Calculator = ReturnType<typeof useRoiCalculator>

const props = defineProps<{ calculator: Calculator }>()

// 提取顶层绑定：嵌套在 prop 对象中的 ref 不会在模板中自动解包
const { sellingPrice, costs, returnRate } = props.calculator

const costFields = [
  { key: 'productCost', label: '产品成本', tip: '商品采购成本' },
  { key: 'shippingCost', label: '物流费用', tip: '仓储与配送费用' },
  { key: 'commission', label: '平台佣金', tip: '平台抽成 / 扣点' },
  { key: 'otherCost', label: '其他费用', tip: '包装、退货等其他成本' },
] as const

/** 退货率输入（百分比单位，内部存储为小数 0~1） */
const returnRatePercentModel = computed<number>({
  get: () => returnRate.value * 100,
  set: (v) => {
    returnRate.value = (v ?? 0) / 100
  },
})
</script>

<template>
  <n-card title="商品售价与成本" size="large">
    <div class="field">
      <label>商品售价</label>
      <n-input-number
        v-model:value="sellingPrice"
        :min="0"
        update-value-on-input
        placeholder="0.00"
      />
    </div>
    <div v-for="f in costFields" :key="f.key" class="field">
      <label>{{ f.label }}<span class="tip">{{ f.tip }}</span></label>
      <n-input-number
        v-model:value="costs[f.key]"
        :min="0"
        update-value-on-input
        placeholder="0.00"
      />
    </div>
    <div class="field">
      <label>退货率<span class="tip">例如 20%</span></label>
      <n-input-number
        v-model:value="returnRatePercentModel"
        :min="0"
        :max="100"
        update-value-on-input
        placeholder="0"
      />
    </div>
  </n-card>
</template>
