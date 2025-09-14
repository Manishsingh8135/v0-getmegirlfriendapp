import colors from "./src/design/tokens/colors.json"
import typography from "./src/design/tokens/typography.json"
import spacing from "./src/design/tokens/spacing.json"
import radii from "./src/design/tokens/radii.json"
import shadows from "./src/design/tokens/shadows.json"
import defaultConfig from "shadcn/ui/tailwind.config"

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...defaultConfig,
  content: [
    ...defaultConfig.content,
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        brand: colors.brand,
        text: colors.text,
        status: colors.status,
      },
      fontFamily: {
        sans: typography.fontFamilies.sans,
        mono: typography.fontFamilies.mono,
      },
      fontSize: typography.fontSizes,
      lineHeight: typography.lineHeights,
      fontWeight: typography.fontWeights,
      spacing: spacing.scale,
      borderRadius: {
        ...defaultConfig.theme.extend.borderRadius,
        ...radii,
      },
      boxShadow: shadows,
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
