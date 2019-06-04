<template>
	<Frame :id="id">
		<Page actionBarHidden="true" />
	</Frame>
</template>

<script>

	function something() {

	}

	export default {
		name: 'RouterView',

		data() {
			return {
				id: ''
			}
		},

		created() {
			this.id = '__router_view__' + this._uid
			this.$router._addView(this)
		}
	}

</script>
