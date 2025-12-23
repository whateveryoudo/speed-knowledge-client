import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  rules: [
    [
      /^menu-item-base$/,
      () => ({
        'color': 'var(--sd-text-body)',
        'display': 'flex',
        'align-items': 'center',
        'height': '32px',
        'margin-top': '4px',
        'margin-bottom': '4px',
        'padding-left': '16px',
        'padding-right': '16px',
        'border-radius': '6px',
        'cursor': 'pointer',
        'gap': '5px'
      }),
    ],
  ],
})
