const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')

const EleventyPluginNavigation = require('@11ty/eleventy-navigation')
const EleventyPluginRss = require('@11ty/eleventy-plugin-rss')
const EleventyPluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')

const rollupPluginCritical = require('rollup-plugin-critical').default

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const pairedShortcodes = require('./utils/paired-shortcodes.js')

const { resolve } = require('path')

const { execSync } = require('child_process')


module.exports = function (eleventyConfig) {
	eleventyConfig.setServerPassthroughCopyBehavior('copy');
	eleventyConfig.addPassthroughCopy("public");

	// Plugins
	eleventyConfig.addPlugin(EleventyPluginNavigation)
	eleventyConfig.addPlugin(EleventyPluginRss)
	eleventyConfig.addPlugin(EleventyPluginSyntaxhighlight)
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: '.11ty-vite', // Default name of the temp folder

		// Vite options (equal to vite.config.js inside project root)
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
				// This puts CSS and JS in subfolders – remove if you want all of it to be in /assets instead
				rollupOptions: {
					output: {
						// assetFileNames: 'assets/css/main.[hash].css',
						// assetFileNames: 'assets/[name]-[hash][extname]',
						assetFileNames: ( assetInfo ) => {
							const info = assetInfo.name.split('.')
							const extType = info[info.length - 1]
							if (/png|webp|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
								return `media/[name][extname]`
							} else if (/css/i.test(extType)) {
								return `css/[name]-[hash][extname]`
							} else {
								// default value
								// ref: https://rollupjs.org/guide/en/#outputassetfilenames
								return 'assets/[name]-[hash][extname]'
							}
						},
						chunkFileNames: 'assets/js/[name]-[hash].js',
						entryFileNames: 'assets/js/[name]-[hash].js'
					},
					plugins: [rollupPluginCritical({
						criticalUrl: './_site/',
						criticalBase: './_site/',
						criticalPages: [
							{ uri: 'index.html', template: 'index' },
							{ uri: 'notes/index.html', template: 'notes/index' },
							{ uri: '404.html', template: '404' },
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
	Object.keys(pairedShortcodes).forEach((pairedShortcodeName) => {
		eleventyConfig.addPairedLiquidShortcode(pairedShortcodeName, pairedShortcodes[pairedShortcodeName])
	})

	eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`)

	// Customize Markdown library and settings:
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
	// eleventyConfig.addPassthroughCopy('src/assets/media')

	// Build PageFind index 
	eleventyConfig.on('eleventy.after', async () => {
		execSync(`npx pagefind --source _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
	})

	// Added due to issue https://github.com/matthiasott/eleventy-plus-vite/issues/2
	// eleventyConfig.setServerPassthroughCopyBehavior("copy")
	// eleventyConfig.addPassthroughCopy('public')

	return {
		templateFormats: ['md', 'njk', 'html', 'liquid'],
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: 'src',
			// better not use "public" as the name of the output folder (see above...)
			output: '_site',
			includes: '_includes',
			layouts: 'layouts',
			data: '_data'
		}
	}
}
