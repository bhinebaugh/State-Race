<template>
    <div
		class="pawn"
		:title="player.name"
		:style="styleObject"
	>
		{{player.location}}
	</div>
</template>

<script>
import { stateInfo } from '../states.js'

export default {
    name: 'Pawn',
	// props: ['name','color','location'],
	props: {
		player: { type: Object }
	},
	data: function() {
		return {
			x: 50, 
			y: 30,
		}
	},
	computed: {
		coordinates: function() {
			// console.debug('location', this.location)
			// console.debug('states',stateObjects)
			return stateInfo[this.player.location].position
		},
		styleObject: function() {
			return {
				top: (this.coordinates[1] + 20) + 'px',
				left: this.coordinates[0] + 'px',
				backgroundColor: this.player.color
			}
		}
	},
}
</script>
