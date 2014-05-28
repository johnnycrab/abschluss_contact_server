require('blanket')({
	// Only files that match the pattern will be instrumented
	pattern: /\.js/,
	"data-cover-never": ["node_modules", "test"]
});
