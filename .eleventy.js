const EleventyPluginNavigation = require('@11ty/eleventy-navigation')
const EleventyPluginRss = require('@11ty/eleventy-plugin-rss')
const EleventyPluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const rollupPluginCritical = require('rollup-plugin-critical').default

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const pairedShortcodes = require('./utils/paired-shortcodes.js')

// const { resolve } = require('path')
const { execSync } = require('child_process')

// markdown
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')

// image gallery
const Image = require('@11ty/eleventy-img')
const path = require('path')
const sharp = require('sharp')
const GALLERY_IMAGE_WIDTH = 320;
const LANDSCAPE_LIGHTBOX_IMAGE_WIDTH = 1440;
const PORTRAIT_LIGHTBOX_IMAGE_WIDTH = 720;

// i18n
const { EleventyI18nPlugin } = require("@11ty/eleventy")

module.exports = function (eleventyConfig) {
	// eleventyConfig.setServerPassthroughCopyBehavior('copy')
	eleventyConfig.addPassthroughCopy("public")

	// plugins
	eleventyConfig.addPlugin(EleventyPluginNavigation)
	eleventyConfig.addPlugin(EleventyPluginRss)
	eleventyConfig.addPlugin(EleventyPluginSyntaxhighlight)
	eleventyConfig.addPlugin(EleventyI18nPlugin, {
		defaultLanguage: "en",
		errorMode: "allow-fallback"
	})
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: './.11ty-vite',
		viteOptions: {
			base: '/nasonero/',
			publicDir: 'public',
			clearScreen: false,
			server: {
				mode: 'development',
				middlewareMode: true,
			},
			appType: 'custom',
			assetsInclude: ['**/*.xml', '**/*.txt'],
			build: {
				mode: 'production',
				sourcemap: 'true',
				manifest: true,
				rollupOptions: {
					output: {
						assetFileNames: (assetInfo) => {
							var info = assetInfo.name.split('.')
							var extType = info[info.length - 1]
							if (
								/png|avif|webp|jpe?g|svg|gif|tiff|bmp|ico/i.test(
									extType
								)
							) {
								return `imgs/[name][extname]`
							} else {
								return `css/[name]-[hash][extname]`
							}
						},
						chunkFileNames: 'assets/js/[name]-[hash].js',
						entryFileNames: 'assets/js/[name]-[hash].js',
						manualChunks: {
							// PhotoSwipe: ['photoswipe'],
							// PhotoSwipeLightbox: ['photoswipe/lightbox'],
							videojs: ['video.js'],
						}
					},
					plugins: [rollupPluginCritical({
						criticalUrl: './_site/',
						criticalBase: './_site/',
						criticalPages: [
							{ uri: 'index.html', template: 'index' },
							{ uri: 'notes/index.html', template: 'notes/index' },
							{ uri: '404.html', template: '404' },
							{ uri: 'about/index.html', template: 'index' },
						],
						criticalConfig: {
							inline: true,
							dimensions: [
								{
									height: 900,
									width: 375,
								},
								{
									height: 720,
									width: 1280,
								},
								{
									height: 1080,
									width: 1920,
								}
							],
							penthouse: {
								forceInclude: ['.fonts-loaded-1 body', '.fonts-loaded-2 body'],
							}
						}
					})
					]
				}
			}
		}
	})

	// Filters
	Object.keys(filters).forEach((filterName) => {
		eleventyConfig.addFilter(filterName, filters[filterName])
	})

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		eleventyConfig.addTransform(transformName, transforms[transformName])
	})

	// Shortcodes
	Object.keys(shortcodes).forEach((shortcodeName) => {
		eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
	})
	eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`)
	eleventyConfig.addShortcode("galleryImage", async function (src, alt) {
		let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`
		let lightboxImageWidth = LANDSCAPE_LIGHTBOX_IMAGE_WIDTH
		if (alt === undefined) throw new Error(`Missing \`alt\` on image from: ${src}`)

		let metadata = await sharp(imageSrc).metadata()
		if (metadata.height > metadata.width) lightboxImageWidth = PORTRAIT_LIGHTBOX_IMAGE_WIDTH

		let genMetadata = await Image(imageSrc, {
			widths: [GALLERY_IMAGE_WIDTH, lightboxImageWidth],
			formats: ["avif", "webp", "jpeg"],
			urlPath: "/media/gallery/",
			outputDir: "./public/media/gallery",
		})
		const imageUrl = eleventyConfig.getFilter("url")(genMetadata.jpeg[1].url)
		const imageWidth = genMetadata.jpeg[1].width
		const imageHeight = genMetadata.jpeg[1].height
		const thumbUrl = eleventyConfig.getFilter("url")(genMetadata.jpeg[0].url)

		return `
			<li>
				<a href="${imageUrl}" 
				data-pswp-width="${imageWidth}" 
				data-pswp-height="${imageHeight}" 
				target="_blank">
					<img src="${thumbUrl}" alt="${alt}"/>
				</a>
			</li>
    	`.replace(/(\r\n|\n|\r)/gm, "")
	})
	// Paired shortcodes
	Object.keys(pairedShortcodes).forEach((pairedShortcodeName) => {
		eleventyConfig.addPairedLiquidShortcode(pairedShortcodeName, pairedShortcodes[pairedShortcodeName])
	})

	// Customize Markdown lib
	let markdownLibrary = markdownIt({
		html: true,
		breaks: true,
		linkify: true
	}).use(markdownItAnchor, {
		permalink: markdownItAnchor.permalink.ariaHidden({
			placement: 'after',
			class: 'direct-link',
			symbol: '#',
			level: [1, 2, 3, 4]
		}),
		slugify: eleventyConfig.getFilter('slug')
	})
	eleventyConfig.setLibrary('md', markdownLibrary)

	// Layouts
	eleventyConfig.addLayoutAlias('base', 'base.njk')
	eleventyConfig.addLayoutAlias('note', 'note.njk')

	// Copy/pass-through files
	eleventyConfig.addPassthroughCopy('src/assets/css')
	eleventyConfig.addPassthroughCopy('src/assets/js')

	// Build pagefind index 
	eleventyConfig.on('eleventy.after', async () => {
		execSync(`npx pagefind --source _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
	})

	return {
		templateFormats: ['md', 'njk', 'html', 'liquid'],
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: 'src',
			output: '_site',
			includes: '_includes',
			layouts: 'layouts',
			data: '_data'
		}
	}
}
