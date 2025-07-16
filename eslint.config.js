import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js, prettier: pluginPrettier },
    extends: ['js/recommended', 'plugin:prettier/recommended'],
    rules: {
      // 必须加分号，改为 "never" 表示不加分号
      // semi: ['error', 'never'],
      // 必须用双引号，改为 "double" 表示双引号
      // quotes: ['error', 'single'],
      // 2 空格缩进
      // indent: ['error', 2],
      // 允许箭头函数只有一个参数时省略括号
      // 'arrow-parens': ['error', 'as-needed'],
      // 允许最后一个属性后不加逗号
      // 'comma-dangle': ['error', 'never'],

      // 禁止未使用变量
      'no-unused-vars': ['warn'],
      // 启用 prettier 作为 eslint 规则
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    rules: {
      // 允许组件名不是多单词（多单词是为了避免和 HTML 标签冲突）
      'vue/multi-word-component-names': 'off',
      // 允许声明为 any 类型
      '@typescript-eslint/no-explicit-any': 'off'
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  }
])
