import RouterView from './components/RouterView'

export default function install(Vue, { routes }) {

	Vue.component('RouterView', RouterView)

	Vue.prototype.$router = new Vue({
		data: {
			routes,
			views: [],
			components: [],
			viewCounter: 0
		},

		methods: {
			async push(path, options = {}) {
				// find record
				let trail = this._findRecord(path, this.routes)

				// if record was not found
				if (!trail.length) {
					throw new Error(`Route (${path}) not found`)
				}

				// set $route data
				this.$route.path = path
				this.$route.matched = trail
				this.$route.params = options.params || {}

				// navigate manually to route
				let i = -1
				for (let matched of trail) {
					i++

					if (this.components[i] && this.components[i] == matched.component) continue
					else {
						this.components.splice(i)
						this.views.splice(i + 1)
					}

					this.components.push(matched.component)

					await this._navigateComponent(matched.component, this.views[i].id, options)
				}
			},

			_navigateComponent(component, viewId, options) {
				return this.$navigateTo(component, {
					...options,
					frame: viewId
				})
			},


			_addView(view) {
				this.views.push(view)
				return this.viewCounter++
			},

			_findRecord(path, tree, trail = []) {
				// level one seach
				let record = tree.find(e => e.path == path)
				let lastTrail = trail[trail.length - 1]
				let parentRecord = lastTrail ? lastTrail.record : null

				if (record) {
					trail.push(record)
					return trail
				}

				// deep search
				let chunks = this._chunkPath(path, !trail.length)

				for (let chunk of chunks) {
					// find ancestor
					let ancestorRecord = tree.find(e => e.path == chunk)

					if (ancestorRecord && ancestorRecord.children) {
						// recursive search
						trail.push(ancestorRecord)
						return this._findRecord(path.substr(chunk.length + 1), ancestorRecord.children, trail)
					}
				}

				return false
			},

			_chunkPath(path, root = true) {
				if (root) path = path.substr(1)

				let parts = path.split('/')
				let chunks = []

				for (let nParts = 1; nParts < parts.length; nParts++) {

					let selectedParts = []

					for (let p = 0; p < nParts; p++) {
						selectedParts.push(parts[p])
					}

					let chunk = selectedParts.join('/')
					if (root) chunk = '/' + chunk

					chunks.push(chunk)
				}

				return chunks
			}
		}

	})

	Vue.prototype.$route = new Vue({
		data: {
			path: '',
			matched: [],
			params: {}
		}
	})

}
