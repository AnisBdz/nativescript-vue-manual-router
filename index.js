import RouterView from './components/RouterView'
import { getFrameById } from 'tns-core-modules/ui/frame'
import Blank from './components/Blank'

export default function install(Vue, { routes }) {

	Vue.component('RouterView', RouterView)

	const defaultOptionsFields = ['animated', 'transition', 'transitioniOS', 'transitionAndroid', 'clearHistory', 'backstackVisible']

	Vue.prototype.$router = new Vue({
		data: {
			routes,
			views: []
		},

		computed: {
			components() {
				return this.views.map(view  => getFrameById(view.id))
								 .map(frame => frame ? frame.currentEntry : null)
								 .map(entry => entry ? entry.__meta : null)
								 .map(meta  => meta  ? meta.component : null)
			}
		},

		created() {
			setInterval(() => this._updateViews(), 100)
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

				// redirects
				let lastRecord = trail[trail.length - 1]

				if (lastRecord.redirect) {
					return this.push(lastRecord.redirect, options)
				}

				for (let i = 0; i < trail.length; i++) {
					let matched = trail[i]

					if (this.components[i] && this.components[i] == matched.component) {
						continue
					}

					else {
						this.views.splice(i + 1)
					}


					if (matched.options) {
						for (let field of defaultOptionsFields) {
							if (matched.options.hasOwnProperty(field) && !options.hasOwnProperty(field)) {
								options[field] = matched.options[field]
							}
						}
					}

					await this._navigateComponent(matched.component, this.views[i].id, options)
				}


				for (let i = trail.length; i < this.views.length; i++) {
					this._navigateComponent(Blank, this.views[i].id, { animated: false })
				}
			},

			_updateViews() {
				this.views = [ ...this.views ]
			},

			_navigateComponent(component, viewId, options) {
				return this.$navigateTo(component, {
					...options,
					frame: viewId,

					__meta: { component }
				})
			},


			_addView(view) {
				this.views.push(view)
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
