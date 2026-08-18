/**
 * 保本 ROI 计算器的领域类型定义。
 * 核心口径：保本ROI = 1 / (g × (1 - r))
 * - g = 不含广告费的毛利率 = (售价 - 产品成本 - 物流 - 佣金 - 其他) / 售价
 * - r = 退货率（0~1）
 */

/** 商品成本与售价输入（不含广告费） */
export interface BreakEvenInput {
  /** 商品售价 */
  sellingPrice: number
  /** 产品成本 */
  productCost: number
  /** 物流费用 */
  shippingCost: number
  /** 平台佣金（扣点） */
  commission: number
  /** 其他费用 */
  otherCost: number
  /** 退货率（0~1，如 20% → 0.2） */
  returnRate: number
}

/** 计算结果 */
export interface BreakEvenResult {
  /** 不含广告费的毛利率 g（售价为 0 时无定义，为 null） */
  grossMargin: number | null
  /** 保本 ROI = 1 / (g × (1 - r))；g 无定义或 g×(1-r) ≤ 0 时无保本线，为 null */
  breakEvenRoi: number | null
}

/** 每单净利润反推所需 ROI 的结果 */
export interface ProfitRoiResult {
  /** 每单扣退货后毛利 = 售价 × g × (1 - r)；售价/毛利率无定义时为 null */
  perOrderGrossProfit: number | null
  /** 目标每单净利润（限制在 0 ~ 每单毛利） */
  netProfit: number
  /** 每单可投入广告费 = 每单毛利 - 净利润；无解（≤ 0）或每单毛利无定义时为 null */
  affordableAdCost: number | null
  /** 对应所需 ROI；每单毛利无定义或净利润 ≥ 每单毛利时为 null */
  requiredRoi: number | null
}
