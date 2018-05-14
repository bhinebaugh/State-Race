<template>
    <div id="player-template" class="player-info">
        <p class="name">{{name}}</p>
        <p>Position: {{location}}</p>
        <p>Mission: {{objective}}</p>
        <p>Neighbors: <span v-for="st in neighbors">{{st}} </span></p>
        <div class="cardsinhand">
            <span v-for="card in cards" 
                    @click="handleCardClick(card)"
                    v-bind:class="{ adjacent: neighbors.indexOf(card) >= 0 }"
                    class="cardbtn"
            >
                {{card}}
            </span>
        </div>
        <div class="discards"><p>Drag unwanted cards here</p></div>
        <p class='control'>
            <span class='or'>or </span>
            <span class='allcardsbtn' @click="handleNewHand">Draw New Cards</span>
        </p>
    </div>
</template>

<script>
export default {
    name: 'Player',
	props: ['active','location','name','objective'],
	data: function() {
		return {
			cards: []
		}
	},
	created: function() {
		this.cards = deck.dealHand(MAX_CARDS);
	},
	methods: {
		discard: function(howMany=1) {
			for( let i=0; i<howMany; i++) {
				let cardIndex = Math.floor( Math.random()*(this.cards.length+1) )
				this.cards.splice(cardIndex,howMany)
			}
		},
		handleCardClick: function(c) {
			if (!this.active) return false;
			var target = this.cards.indexOf(c)
			if (target >= 0) {
				this.cards.splice(target,1)
				if (this.neighbors.indexOf(c) >= 0) {
					this.$emit('travel', c)
				}
				this.handleDrawCards()
				this.$emit('end-turn')
			} else {
				console.error('card not found in hand')
			}
		},
		handleDrawCards: function() { 
			var numberToDraw = MAX_CARDS - this.cards.length
			this.cards = this.cards.concat( deck.dealHand(numberToDraw) )
		},
		handleNewHand: function() {
			this.cards = deck.dealHand(MAX_CARDS)
		}
	},
	computed: {
		neighbors: function() {
			return stateInfo[this.location].neighbors 
		}
	},
	// <card v-for="card in cards" :abbrev="card" :location="location" v-on:remove-card="handleCardClick(card)" />
}
</script>