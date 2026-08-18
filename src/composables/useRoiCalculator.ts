import { computed, reactive, ref, watch } from 'vue'
import type { BreakEvenResult, ProfitRoiResult } from '../types/roi'
import { calcBreakEven, calcProfitRoi } from '../utils/roi'

/**
 * 保本 ROI 计算器状态源。
 * 输入商品售价 + 各项成本（不含广告费）+ 退货率 → 实时计算毛利率 g 与保本 ROI。
 * 保本ROI = 1 / (g × (1 - r))
 */
export function useRoiCalculator() {
  const sellingPrice = ref(0)
  const costs = reactive({
    productCost: 0,
    shippingCost: 0,
    commission: 0,
    otherCost: 0,
  })
  /** 退货率（小数，0~1，如 20% → 0.2） */
  const returnRate = ref(0)

  const result = computed<BreakEvenResult>(() =>
    calcBreakEven({
      sellingPrice: sellingPrice.value,
      productCost: costs.productCost,
      shippingCost: costs.shippingCost,
      commission: costs.commission,
      otherCost: costs.otherCost,
      returnRate: returnRate.value,
    }),
  )
  const grossMargin = computed(() => result.value.grossMargin)
  const breakEvenRoi = computed(() => result.value.breakEvenRoi)

  /* ---------- 每单净利润（0 ~ 每单毛利）→ 所需 ROI ---------- */
  const netProfit = ref(0)

  const profitRoi = computed<ProfitRoiResult>(() =>
    calcProfitRoi(
      sellingPrice.value,
      grossMargin.value,
      returnRate.value,
      netProfit.value,
    ),
  )

  // 净利润限制在 0 ~ 每单毛利：当每单毛利变化导致越界时自动钳制
  watch(
    () => profitRoi.value.perOrderGrossProfit,
    (max) => {
      if (max === null || netProfit.value > max) {
        netProfit.value = max === null ? 0 : max
      }
    },
  )

  return {
    sellingPrice,
    costs,
    returnRate,
    grossMargin,
    breakEvenRoi,
    netProfit,
    profitRoi,
  }
}
