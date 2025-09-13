import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// import dts from 'vite-plugin-dts'
// import { viteStaticCopy } from 'vite-plugin-static-copy'

const config = defineConfig({
    build: {
        minify: false,
        lib: {
            entry: ["./src/index.ts"],
            name: "@woby/wheeler",
            formats: [/*'cjs', '*/'es'/*, 'umd'*/],
            fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
        },
        sourcemap: true,
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', '@woby/use', 'nanoid'],
            output: {
                globals: {
                    '@woby/use': '@woby/use',
                    'woby': 'woby',
                    'oby': 'oby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                    'nanoid': 'nanoid',
                }
            }
        }
    },
    esbuild: {
        jsx: 'automatic',
    },
    plugins: [
        // dts({ entryRoot: './src', outDir: './dist/types' }),
        // viteStaticCopy({
        //     targets: [
        //         {
        //             src: 'src/*.scss',
        //             dest: './'
        //         }
        //     ]
        // }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
})



export default config
