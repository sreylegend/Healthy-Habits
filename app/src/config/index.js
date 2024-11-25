export const config = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  
  // App Configuration
  APP_NAME: 'Healthy Habits Coach',
  VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    SOCIAL_LOGIN: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    ANALYTICS: true,
  },
  
  // Theme Configuration
  THEME: {
    PRIMARY_COLOR: '#4CAF50',
    SECONDARY_COLOR: '#2196F3',
    ACCENT_COLOR: '#FF9800',
    ERROR_COLOR: '#f44336',
    SUCCESS_COLOR: '#4CAF50',
    WARNING_COLOR: '#ff9800',
    INFO_COLOR: '#2196f3',
    BACKGROUND_COLOR: '#ffffff',
    TEXT_COLOR: '#000000',
  },
  
  // Animation Configuration
  ANIMATION: {
    DURATION: 300,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
    HABITS: '@habits',
    SETTINGS: '@settings',
  },
};
