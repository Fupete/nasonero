const Image = require("@11ty/eleventy-img");

module.exports = {

    image: async function(src, alt, sizes = '100vw') {
        // let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`

        let metadata = await Image(src, {
			widths: [300, 600],
			formats: ["avif", "jpeg"],
            outputDir: "./_site/img/",
            // outputDir: path.dirname(this.page.outputPath),
            // urlPath: this.page.url,
		})

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		}

        // return `<picture>
        // // picture markup goes here
        // </picture>`

		return Image.generateHTML(metadata, imageAttributes)
    },
       
}