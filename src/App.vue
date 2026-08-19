<script setup lang="ts">
import { NConfigProvider, NGlobalStyle } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useRoiCalculator } from './composables/useRoiCalculator'
import InputForm from './components/InputForm.vue'
import ResultPanel from './components/ResultPanel.vue'
import ProfitRoiPanel from './components/ProfitRoiPanel.vue'

const calculator = useRoiCalculator()

/** 构建版本标记：用于确认手机端加载的是否为最新构建 */
const appVersion = 'v2.1.0'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0e7a6a',
    primaryColorHover: '#0f8f7d',
    primaryColorPressed: '#0b6a5d',
    primaryColorSuppl: '#0f8f7d',
    borderRadius: '10px',
  },
  Card: {
    borderRadius: '14px',
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-global-style />
    <main class="page">
      <header class="page-header">
        <h1>Sellora <span>保本 ROI 计算器</span></h1>
        <p class="page-subtitle">
          输入商品售价、各项成本（不含广告费）与退货率，自动计算毛利率 g 与保本 ROI；
          还可拖动滑块设定每单净利润，反推所需广告 ROI。
        </p>
      </header>
      <div class="layout">
        <InputForm :calculator="calculator" />
        <div class="layout-right">
          <ResultPanel :calculator="calculator" />
          <ProfitRoiPanel :calculator="calculator" />
        </div>
      </div>
      <footer class="page-footer">Sellora 保本 ROI 计算器 · {{ appVersion }}</footer>
    </main>
  </n-config-provider>
</template>
