import RouterView from './components/RouterView'

export default function install(Vue, { routes }) {

	Vue.component('RouterView', RouterView)

	Vue.prototype.$router = new Vue({
		data: {
			views: [],
			routes
		},

		methods: {
			push(path, options = {}) {
				// find record
				let matchedRecord = this._findRecord(path, this.routes)

				// if record was not found
				if (!matchedRecord) {
					throw new Error(`Route (${path}) not found`)
				}

				// set $route data
				this.$route.record = matchedRecord.record
				this.$route.params = options.params || {}

				// navigate manually to route
				this.$navigateTo(matchedRecord.record.component, options)
			},

			_findRecord(path, tree) {
				// level one seach
				let record = tree.find(e => e.path == path)

				if (record) {
					return {
						record,
						nested: false
					}
				}

				// deep search
				let chunks = this._chunkPath()

				for (let chunk of chunks) {
					// find ancestor
					let ancestorRecord = tree.find(e => e.path == chunk)

					if (ancestorRecord && ancestorRecord.children) {
						// recursive search
						return this._findRecord(path.substr(chunk.length + 1), ancestorRecord.children)
					}
				}

				return false
			},

			_chunkPath(path) {
				let parts = path.split('/')
				let chunks = []

				for (let nParts = 1; nParts < parts.length; nParts++) {

					let chunk = ''

					for (let p = 0; p < nParts; p++) {
						chunk += parts[p]
					}

					chunks.push(chunk)
				}

				return chunks
			}
		}

	})

	Vue.prototype.$route = new Vue({
		data: {
			params: {},
			record: null
		}
	})

}
