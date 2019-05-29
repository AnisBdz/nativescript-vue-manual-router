<!-- <template>
	<Frame>
		<slot />
	</Frame>
</template> -->

<script>

	export default {
		props: {
			nested: {
				type: Boolean,
				default: false
			}
		},

		render(h) {
			const emptyPage = h('page', { actionBarHidden: true }, [])

			if (!this.nested) {
				return h('frame', {}, [ emptyPage ])
			}

			else {
				return h('frame', {}, [h('page', { actionBarHidden: true }, [ ]) ])
			}
		},

		mounted() {
			console.log(this.nested)
		}
	}

</script>
