const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // Enable YAML data files
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Page show / hide (driven by src/_data/pages.yml, editable in the CMS).
  // A page declares `pageId` in its front matter; if that id's toggle is false,
  // skip building it entirely so its URL 404s and it leaves all collections.
  eleventyConfig.addPreprocessor("hidePages", "html,njk,md", (data) => {
    if (data.pageId && data.pages && data.pages[data.pageId] === false) {
      return false;
    }
  });

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
