module.exports = {

	gallery: function (content, name) {
		return `
		<div>
			<div class="gallery" id="gallery-${name}">
				<ul>
					${content}
				</ul>
			</div>
		</div>
		`.replace(/(\r\n|\n|\r)/gm, "")
	},
}