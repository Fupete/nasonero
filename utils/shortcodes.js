const Image = require("@11ty/eleventy-img")
const path = require('path')

module.exports = {

	video: async function (id, mp4, webm) {
		return `
		<div>
			<video id="${id}" class="video-js" data-setup='{
				"fluid": true, 
				"responsive": true,
				"controls": true,
				"preload": "auto"
			}'>
			<source src="${mp4}" type="video/mp4">
			<source src="${webm}" type="video/webm">
			</video>
		</div>
		`
	},

	videoYoutube: async function (id, url) {
		return `
		<div>
			<video id="${id}" class="video-js" data-setup='{
				"fluid": true, 
				"responsive": true,
				"controls": true,
				"preload": "none",
				"techOrder": ["youtube"]
			}'>
			<source src="${url}" type="video/youtube">
			</video>
		</div>
		`
	},

	image: async function (src, alt, sizes = '100vw', widths = [320, 640, 1280]) {
		let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`
		if (alt === undefined) throw new Error(`Missing \`alt\` on image from: ${src}`)

		let metadata = await Image(imageSrc, {
			widths: widths,
			formats: ["avif", "webp", "jpeg"],
			urlPath: "/imgs/",
			outputDir: "./_site/imgs/",
		})

		return Image.generateHTML(metadata, attributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "auto",
		})
	}

}