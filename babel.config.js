module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // required
    plugins: ["nativewind/babel"]   // only this plugin for Tailwind
  };
};
