<template>
	<Frame :id="id">
		<Page actionBarHidden="true" />
	</Frame>
</template>

<script>

	export default {
		name: 'RouterView',

		data() {
			return {
				id: ''
			}
		},

		created() {
			this.id = '__router_view__' + this.$router._addView(this)
		}
	}

</script>
