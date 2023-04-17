const Image = require("@11ty/eleventy-img");

module.exports = {

    /*

    imageShortcode: async function (src, alt, sizes = '100vw') {
        let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`
        let metadata = await Image(imageSrc, {
            widths: [300, 600],
            // Write processed images to the correct `outputPath`
            outputDir: path.dirname(this.page.outputPath),
            // Prepend the correct path to the image `src` value
            urlPath: this.page.url,
        })
        return `<picture>
        // picture markup goes here
        </picture>`
    }

    eleventyConfig.addShortcode("image", async function(src, alt, sizes) {
		let metadata = await Image(src, {
			widths: [300, 600],
			formats: ["avif", "jpeg"]
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes);
	});

        */
}