const Image = require("@11ty/eleventy-img")
const path = require('path')

module.exports = {

    image: async function(src, alt, sizes = '100vw') {
        let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`

        let metadata = await Image(imageSrc, {
			widths: [320, 640, 1280],
			formats: ["avif", "webp", "jpeg"],
            // outputDir: "./_site/img/",
            outputDir: path.dirname(this.page.outputPath),
            urlPath: this.page.url,
		})

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "auto",
		}

		return Image.generateHTML(metadata, imageAttributes)
    },
       
}