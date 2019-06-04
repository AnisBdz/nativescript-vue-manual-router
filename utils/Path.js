export default class Path {
	constructor(path) {
		this.path = path
	}

	isAbsolute() {
		return this.path[0] == '/'
	}

	isRelative() {
		return !this.isAbsolute()
	}

	toAbsolutePath(base) {
		if (base[0] == '/') base = base.substr(1)

		let baseChunks = base.split('/')
		let pathChunks = this.path.split('/')

		let i

		for (i = 0; i < pathChunks.length; i++) {
			if (pathChunks[i] == '..') baseChunks.pop()
			else if (pathChunks[i] == '.') continue
			else break
		}

		let path = '/' + [ baseChunks.join('/'), pathChunks.slice(i) ].join('/')
		if (path[path.length - 1] == '/') path = path.substr(0, path.length - 1)
		if (path.substr(0, 2) == '//') path = path.substr(1)

		return path
	}
}
