import { safeOpenWindow } from './safe-url';

// Platform-specific utilities for web
export const platformUtils = {
  // Open URL in new tab (only http/https/mailto/tel schemes allowed)
  openURL: async (url: string) => {
    safeOpenWindow(url);
  },

  // Make phone call (web - opens phone app)
  makePhoneCall: async (phoneNumber: string) => {
    globalThis.location.href = `tel:${phoneNumber}`;
  },

  // Send email
  sendEmail: async (email: string, subject?: string, body?: string) => {
    let url = `mailto:${email}`;
    const params = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    globalThis.location.href = url;
  },

  // Share content using Web Share API
  shareContent: async (content: { title?: string; message: string; url?: string }) => {
    // Web - use Web Share API or fallback to clipboard
    if (navigator.share && content.url) {
      try {
        await navigator.share({
          title: content.title,
          text: content.message,
          url: content.url,
        });
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(content.message + (content.url ? ` ${content.url}` : ''));
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  },

  // Get web styles (for compatibility with mobile versions)
  getPlatformStyle: (styles: {
    ios?: any;
    android?: any;
    web?: any;
    default?: any;
  }) => {
    return styles.web || styles.default || {};
  },

  // Check if running in development mode
  isDevelopment: () => {
    return import.meta.env.DEV;
  },

  // Get platform (always 'web')
  getPlatformVersion: () => {
    return 'web';
  },

  // Compatibility methods (no-ops for web)
  isIOSVersionAtLeast: (_version: number) => {
    return false;
  },

  isAndroidAPIAtLeast: (_apiLevel: number) => {
    return false;
  },
};