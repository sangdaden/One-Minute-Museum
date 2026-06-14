/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#f7f1e3",
        "paper-card": "#fff9ef",
        "paper-sunk": "#efe6d4",
        ink: "#2f2621",
        "ink-soft": "#7a6a5f",
        "ink-faint": "#9f8e7e",
        accent: "#a8322a",
        "accent-deep": "#7e241d",
        gold: "#c89b3c",
        teal: "#2f7c74",
        "teal-deep": "#245f58",
        border: "#e3d2b8",
        "border-strong": "#d6c19d",
      },
      fontFamily: {
        serif: ["Lora_500Medium"],
        "serif-bold": ["Lora_600SemiBold"],
        sans: ["BeVietnamPro_400Regular"],
        "sans-medium": ["BeVietnamPro_500Medium"],
      },
    },
  },
  plugins: [],
};
