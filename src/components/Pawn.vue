export default {
    name: 'Pawn',
	props: ['name','color','location'],
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
			return stateInfo[this.location].position
		},
		styleObject: function() {
			return {
				top: (this.coordinates[1] + 340) + 'px',
				left: this.coordinates[0] + 'px',
				backgroundColor: this.color
			}
		}
	},
}

<template>
    <div class="pawn" :title="name" :style="styleObject">{{location}}</div>
</template>