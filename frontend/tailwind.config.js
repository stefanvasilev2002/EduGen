/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e6f1ff',
                    100: '#cce3ff',
                    200: '#99c7ff',
                    300: '#66aaff',
                    400: '#338eff',
                    500: '#0071ff',
                    600: '#005acc',
                    700: '#004499',
                    800: '#002d66',
                    900: '#001733',
                },
            },
        },
    },
    plugins: [],
}