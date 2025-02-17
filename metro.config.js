const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
    unstable_conditionNames: ['require', 'import'],
  },
};

module.exports = config; 