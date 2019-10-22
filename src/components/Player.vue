<template>
    <div id="player-template" class="player-info" :class="{ active: active }">
        <p class="name">{{player.name}}</p>
        <p>Position: {{player.location}}</p>
        <p>Mission: {{player.objective}}</p>
        <p>Neighbors: <span v-for="st in neighbors" :key="st">{{st}} </span></p>
        <div class="cardsinhand">
            <span v-for="card in cards" 
                    @click="handleCardClick(card)"
					:key="card"
                    :class="{ adjacent: neighbors.indexOf(card) >= 0 }"
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
import { stateInfo } from '../states.js'
import { deck, MAX_CARDS } from '../cards.js'

export default {
    name: 'Player',
	// props: ['active','location','name','objective'],
	props: {
		player: { type: Object, required: true },
		active: { type: Boolean },
	},
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
			return stateInfo[this.player.location].neighbors 
		}
	},
	// <card v-for="card in cards" :abbrev="card" :location="location" v-on:remove-card="handleCardClick(card)" />
}
</script>

<style lang="scss">
.cardbtn { 
	background: #efeff8;
	color: #773300; 
	cursor: pointer;
	margin:3px;
	padding:3px; 
	font: 1em sans-serif; 
	z-index: 300; 
}
.adjacent {
	border-bottom: 3px solid #eebb66;
}
.human .cardbtn {
	cursor: pointer;
}
.human div.cardsinhand {
	border: 1px dashed #cccccc;
}
.destination { 
	color: #888888;
	font-size: 75%;
	overflow: hidden;
	visibility: hidden;
}
.destination-drop {
	background: #e0e0e0;
	border: 1px solid #aaa;
	padding: 2px;
	visibility: visible;
}
.destination-over {
	background: #d0dfd0;
	border: 2px solid #8d5;
}
div.discards {
	background: #d3cbdf;
	margin: auto;
	padding: 10px;
	text-align: center;
}
div.discards p {
	font-size: 0.8em;
}
.discards .control {
	border-top: 1px solid #ffaa66;
	font-size: 80%;
	margin: 5px;
	padding: 3px;
	text-align: right;
}
.discards .allcardsbtn { 
	background: #ffaa99;
	border: solid 1px #77aa77;
	color: #444422;
	cursor: pointer; 
	padding: 3px;
	text-align: center;
}

.player-info {
	background: #ede8ffcc;
	border: solid 1px #b3ada6;
	box-shadow: 0px 1px 1px #817ab3;
	margin: 8px 0;
	padding: 5px;
	width: 250px;
}
.active {  /*used with .player-info and .pawn*/
	animation: pulse 1.2s linear infinite alternate;
	&:before {
		content: 'hello before';
		border: solid 4px blue;
	}
}
@keyframes pulse {
	from { box-shadow: 0 0 12px rgb(148, 115, 163); }
	to { box-shadow: 0 0 2px rgb(194, 131, 223); }
}
.player-info.current.start {
	box-shadow: 0 0 12px rgb(255, 127, 20);
	-khtml-transition: box-shadow 0.75s ease-in-out 0;
	-moz-transition: box-shadow 0.75s ease-in-out 0;
	-o-transition: box-shadow 0.75s ease-in-out 0;
	-webkit-transition: box-shadow 0.75s ease-in-out 0;
	transition: box-shadow 0.75s ease-in-out 0;
}

.player-info.current.end {
	box-shadow: 0 0 6px rgb(255, 220, 20);
	-khtml-transition: box-shadow 0.75s ease-in-out 0;
	-moz-transition: box-shadow 0.75s ease-in-out 0;
	-o-transition: box-shadow 0.75s ease-in-out 0;
	-webkit-transition: box-shadow 0.75s ease-in-out 0;
	transition: box-shadow 0.75s ease-in-out 0;
}
.player-info p {
	color: #777777;
	font-size: 14px;
	margin: 0;
}
span.objective, 
span.location {
	color: #000000;
}
.name {
	border-bottom: 1px solid #dddddd;
	color: #555555;
	font-weight: bold;
}
</style>