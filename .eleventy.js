const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // Enable YAML data files
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Local dev server
  eleventyConfig.setServerOptions({ port: 8765 });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"]
  };
};
