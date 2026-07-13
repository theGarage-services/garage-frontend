import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const frontendPort = Number.parseInt(env.VITE_FRONTEND_PORT || '5000', 10);

  return {
    plugins: [react()],
    base: '/',
  
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        // Library aliases
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',

        // Radix UI aliases
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',

        // Figma asset aliases
        'figma:asset/f5fac11c01a60e372bdbe156841128ba6926f1d0.png': path.resolve(
          __dirname,
          './assets/f5fac11c01a60e372bdbe156841128ba6926f1d0.png'
        ),
        'figma:asset/f41a7265fbd0207a04bf4698fb2ddab3e9942bd7.png': path.resolve(
          __dirname,
          './assets/f41a7265fbd0207a04bf4698fb2ddab3e9942bd7.png'
        ),
        'figma:asset/c80c5b6046d8d3239d40b87beb6078d2ee556b02.png': path.resolve(
          __dirname,
          './assets/c80c5b6046d8d3239d40b87beb6078d2ee556b02.png'
        ),
        'figma:asset/9b906b1a1d9521b5af2a82d75e35ab22e5363727.png': path.resolve(
          __dirname,
          './assets/9b906b1a1d9521b5af2a82d75e35ab22e5363727.png'
        ),
        'figma:asset/5d47026abe4e77aa0174b98e6e5497be2b9b5962.png': path.resolve(
          __dirname,
          './assets/5d47026abe4e77aa0174b98e6e5497be2b9b5962.png'
        ),
        'figma:asset/4473a6016a6bdce6537f66effefe0acf8a3fa626.png': path.resolve(
          __dirname,
          './assets/4473a6016a6bdce6537f66effefe0acf8a3fa626.png'
        ),

        // Root alias
        '@': path.resolve(__dirname, './src')
      }
    },

    build: {
      target: 'esnext',
      outDir: 'docs',
      chunkSizeWarningLimit: 1000,
    },

    server: {
      port: frontendPort,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: {
        overlay: false
      }
    },

    // Ensure proper handling of client-side routing in preview mode
    preview: {
      port: frontendPort,
      host: '0.0.0.0'
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: []
    }
  };
});
