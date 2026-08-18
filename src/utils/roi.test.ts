import { describe, expect, it } from 'vitest'
import {
  calcBreakEven,
  calcBreakEvenRoi,
  calcGrossMargin,
  calcMarginCost,
  calcPerOrderGrossProfit,
  calcProfitRoi,
  calcRequiredRoi,
  formatCurrency,
  formatPercent,
} from './roi'

const baseInput = {
  sellingPrice: 100,
  productCost: 30,
  shippingCost: 10,
  commission: 5,
  otherCost: 5,
  returnRate: 0.2,
}

describe('calcMarginCost', () => {
  it('汇总不含广告费的成本', () => {
    expect(calcMarginCost(baseInput)).toBe(50)
  })

  it('全零成本返回 0', () => {
    expect(
      calcMarginCost({
        ...baseInput,
        productCost: 0,
        shippingCost: 0,
        commission: 0,
        otherCost: 0,
      }),
    ).toBe(0)
  })
})

describe('calcGrossMargin', () => {
  it('g = (售价 - 成本) / 售价', () => {
    expect(calcGrossMargin(100, 50)).toBeCloseTo(0.5)
  })

  it('售价为 0 返回 null', () => {
    expect(calcGrossMargin(0, 50)).toBeNull()
  })

  it('售价低于成本时毛利率为负', () => {
    expect(calcGrossMargin(80, 100)).toBeCloseTo(-0.25)
  })
})

describe('calcBreakEvenRoi', () => {
  it('保本ROI = 1 / (g × (1 - r))', () => {
    // g=0.5, r=0.2 → 1/(0.5×0.8) = 2.5
    expect(calcBreakEvenRoi(0.5, 0.2)).toBeCloseTo(2.5)
  })

  it('无退货时 = 1 / g', () => {
    expect(calcBreakEvenRoi(0.3, 0)).toBeCloseTo(1 / 0.3)
  })

  it('g 为 null 返回 null', () => {
    expect(calcBreakEvenRoi(null, 0.2)).toBeNull()
  })

  it('毛利率为负时返回 null（永远亏本）', () => {
    expect(calcBreakEvenRoi(-0.1, 0)).toBeNull()
  })

  it('100% 退货时返回 null', () => {
    expect(calcBreakEvenRoi(0.5, 1)).toBeNull()
  })
})

describe('calcBreakEven', () => {
  it('综合计算：售价100/成本50/退货20% → g=0.5, 保本ROI=2.5', () => {
    const r = calcBreakEven(baseInput)
    expect(r.grossMargin).toBeCloseTo(0.5)
    expect(r.breakEvenRoi).toBeCloseTo(2.5)
  })

  it('售价为 0 时两者为 null', () => {
    const r = calcBreakEven({ ...baseInput, sellingPrice: 0 })
    expect(r.grossMargin).toBeNull()
    expect(r.breakEvenRoi).toBeNull()
  })

  it('退货率提高会抬高保本ROI', () => {
    const noReturn = calcBreakEven({ ...baseInput, returnRate: 0 })
    const withReturn = calcBreakEven(baseInput)
    expect(withReturn.breakEvenRoi).toBeGreaterThan(noReturn.breakEvenRoi!)
  })
})

describe('formatCurrency', () => {
  it('千分位格式化', () => {
    expect(formatCurrency(1234567.5)).toBe('1,234,567.50')
  })

  it('负数', () => {
    expect(formatCurrency(-1234.5)).toBe('-1,234.50')
  })

  it('零', () => {
    expect(formatCurrency(0)).toBe('0.00')
  })
})

describe('formatPercent', () => {
  it('0.6 → 60%', () => {
    expect(formatPercent(0.6)).toBe('60%')
  })

  it('1.5 → 150%', () => {
    expect(formatPercent(1.5)).toBe('150%')
  })

  it('-0.25 → -25%', () => {
    expect(formatPercent(-0.25)).toBe('-25%')
  })

  it('null → —', () => {
    expect(formatPercent(null)).toBe('—')
  })
})

describe('calcPerOrderGrossProfit', () => {
  it('售价 × g × (1 - r)', () => {
    expect(calcPerOrderGrossProfit(100, 0.5, 0.2)).toBeCloseTo(40)
  })

  it('售价为 0 返回 null', () => {
    expect(calcPerOrderGrossProfit(0, 0.5, 0.2)).toBeNull()
  })

  it('g 为 null 返回 null', () => {
    expect(calcPerOrderGrossProfit(100, null, 0.2)).toBeNull()
  })
})

describe('calcRequiredRoi', () => {
  it('净利润 0 → 保本ROI（100/40 = 2.5）', () => {
    expect(calcRequiredRoi(100, 40, 0)).toBeCloseTo(2.5)
  })

  it('净利润 20 → 100/(40-20) = 5', () => {
    expect(calcRequiredRoi(100, 40, 20)).toBeCloseTo(5)
  })

  it('净利润 ≥ 每单毛利时无法实现，返回 null', () => {
    expect(calcRequiredRoi(100, 40, 40)).toBeNull()
    expect(calcRequiredRoi(100, 40, 50)).toBeNull()
  })

  it('每单毛利为 null 返回 null', () => {
    expect(calcRequiredRoi(100, null, 10)).toBeNull()
  })
})

describe('calcProfitRoi', () => {
  it('净利润 10 → 可投入广告费 30，所需ROI 100/30 = 3.33', () => {
    const r = calcProfitRoi(100, 0.5, 0.2, 10)
    expect(r.perOrderGrossProfit).toBeCloseTo(40)
    expect(r.netProfit).toBe(10)
    expect(r.affordableAdCost).toBeCloseTo(30)
    expect(r.requiredRoi).toBeCloseTo(100 / 30)
  })

  it('净利润 0 → 可投入广告费 40（= 每单毛利），保本ROI', () => {
    const r = calcProfitRoi(100, 0.5, 0.2, 0)
    expect(r.affordableAdCost).toBeCloseTo(40)
    expect(r.requiredRoi).toBeCloseTo(2.5)
  })

  it('净利润 = 每单毛利 → 无解，可投入广告费与所需ROI 均为 null', () => {
    const r = calcProfitRoi(100, 0.5, 0.2, 40)
    expect(r.affordableAdCost).toBeNull()
    expect(r.requiredRoi).toBeNull()
  })

  it('售价为 0 → 每单毛利/可投入广告费/所需ROI 均为 null', () => {
    const r = calcProfitRoi(0, 0.5, 0.2, 10)
    expect(r.perOrderGrossProfit).toBeNull()
    expect(r.affordableAdCost).toBeNull()
    expect(r.requiredRoi).toBeNull()
  })
})
