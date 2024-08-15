// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const sourceExts = ["js", "jsx", "json", "ts", "tsx", "cjs", "mjs"];
const assetExts = ["glb", "gltf", "png", "jpg"];

config.resolver.sourceExts = [...config.resolver.sourceExts, ...sourceExts];
config.resolver.assetExts = [...config.resolver.assetExts, ...assetExts];

module.exports = config;
