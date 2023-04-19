const Image = require("@11ty/eleventy-img")
const path = require('path')
const sharp = require('sharp')

const GALLERY_IMAGE_WIDTH = 320;
const LANDSCAPE_LIGHTBOX_IMAGE_WIDTH = 1440;
const PORTRAIT_LIGHTBOX_IMAGE_WIDTH = 720;

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

		if (alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
		}

		let metadata = await Image(imageSrc, {
			widths: widths,
			formats: ["avif", "webp", "jpeg"],
			urlPath: "/media/",
			outputDir: "./_site/media/",
			// outputDir: path.dirname(this.page.outputPath),
			// urlPath: this.page.url,
		})

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "auto",
		}

		return Image.generateHTML(metadata, imageAttributes)
	},

	galleryImage: async function (src, alt) {
		let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`
		let lightboxImageWidth = LANDSCAPE_LIGHTBOX_IMAGE_WIDTH

		if (alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
		}

		const metadata = await sharp(imageSrc).metadata()

		if (metadata.height > metadata.width) {
			lightboxImageWidth = PORTRAIT_LIGHTBOX_IMAGE_WIDTH
		}

		let genMetadata = await Image(imageSrc, {
			widths: [GALLERY_IMAGE_WIDTH, lightboxImageWidth],
			formats: ["avif", "webp", "jpeg"],
			urlPath: "/media/",
			outputDir: "./_site/media/",
			// outputDir: path.dirname(this.page.outputPath),
			// urlPath: this.page.url,
		})

		return `
			<li>
				<a href="${genMetadata.jpeg[1].url | url }" 
				data-pswp-width="${genMetadata.jpeg[1].width}" 
				data-pswp-height="${genMetadata.jpeg[1].height}" 
				target="_blank">
					<img src="${genMetadata.jpeg[0].url | url }" alt="${alt}" />
				</a>
			</li>
    	`.replace(/(\r\n|\n|\r)/gm, "")
	},

}