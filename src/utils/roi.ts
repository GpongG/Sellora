import type {
  BreakEvenInput,
  BreakEvenResult,
  ProfitRoiResult,
} from '../types/roi'

/** 毛利率口径的成本汇总（不含广告费） */
export function calcMarginCost(input: BreakEvenInput): number {
  return (
    input.productCost +
    input.shippingCost +
    input.commission +
    input.otherCost
  )
}

/** 毛利率 g = (售价 - 成本) / 售价；售价为 0 时无定义，返回 null */
export function calcGrossMargin(
  sellingPrice: number,
  marginCost: number,
): number | null {
  if (sellingPrice === 0) return null
  return (sellingPrice - marginCost) / sellingPrice
}

/**
 * 保本 ROI = 1 / (g × (1 - r))。
 * g 无定义或 g×(1-r) ≤ 0（毛利为负 / 100% 退货）时无保本线，返回 null。
 */
export function calcBreakEvenRoi(
  grossMargin: number | null,
  returnRate: number,
): number | null {
  if (grossMargin === null) return null
  const effectiveMargin = grossMargin * (1 - returnRate)
  if (effectiveMargin <= 0) return null
  return 1 / effectiveMargin
}

/** 综合计算：给定售价、成本分项与退货率，返回毛利率 g 与保本 ROI */
export function calcBreakEven(input: BreakEvenInput): BreakEvenResult {
  const marginCost = calcMarginCost(input)
  const grossMargin = calcGrossMargin(input.sellingPrice, marginCost)
  const breakEvenRoi = calcBreakEvenRoi(grossMargin, input.returnRate)
  return { grossMargin, breakEvenRoi }
}

/** 每单扣退货后的毛利 = 售价 × g × (1 - r)；售价/毛利率无定义时为 null */
export function calcPerOrderGrossProfit(
  sellingPrice: number,
  grossMargin: number | null,
  returnRate: number,
): number | null {
  if (grossMargin === null || sellingPrice === 0) return null
  return sellingPrice * grossMargin * (1 - returnRate)
}

/** 由每单净利润反推所需 ROI = 售价 / (每单毛利 - 净利润)；净利润 ≥ 每单毛利时无法实现，返回 null */
export function calcRequiredRoi(
  sellingPrice: number,
  perOrderGrossProfit: number | null,
  netProfit: number,
): number | null {
  if (perOrderGrossProfit === null) return null
  const affordableAdCost = perOrderGrossProfit - netProfit
  if (affordableAdCost <= 0) return null
  return sellingPrice / affordableAdCost
}

/** 由每单净利润反推所需 ROI（净利润限制在 0 ~ 每单毛利 之间） */
export function calcProfitRoi(
  sellingPrice: number,
  grossMargin: number | null,
  returnRate: number,
  netProfit: number,
): ProfitRoiResult {
  const perOrderGrossProfit = calcPerOrderGrossProfit(
    sellingPrice,
    grossMargin,
    returnRate,
  )
  const affordableAdCost =
    perOrderGrossProfit === null ? null : perOrderGrossProfit - netProfit
  return {
    perOrderGrossProfit,
    netProfit,
    affordableAdCost:
      affordableAdCost !== null && affordableAdCost > 0
        ? affordableAdCost
        : null,
    requiredRoi: calcRequiredRoi(sellingPrice, perOrderGrossProfit, netProfit),
  }
}

/** 千分位数字格式化（金额/倍数，保留指定位数小数） */
export function formatCurrency(value: number, digits = 2): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** 百分比格式化（比率 0.6 → "60%"）；null 或非有限值返回 "—" */
export function formatPercent(ratio: number | null, digits = 2): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—'
  return `${Number((ratio * 100).toFixed(digits))}%`
}
