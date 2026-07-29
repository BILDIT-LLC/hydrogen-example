import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-dom/client'],
    tsconfigPaths: true,
  },
  build: {
    assetsInlineLimit: 0,
  },
  ssr: {
    noExternal: [
      '@bildit-platform/hydrogen',
      '@bildit-platform/react-core',
      '@bildit-platform/engine',
    ],
    optimizeDeps: {
      include: [
        'react-is',
        'react-dom/client',
        'react-error-boundary',
        'react-fast-compare',
        'react-router',
      ],
    },
  },
});
