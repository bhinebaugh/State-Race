/*******
April 2018
Objective:
Progress:
	implement basic game rules
	object-orient players and cards
	use Vue for display of players and cards
To-do:
	vue-cli and building + transpiling
	vue-draggable for interacting with cards
	single file components
	unit tests
Questions:
	svg display
	jquery linking
	indexOf breaks on IE < 9
********/

const MAX_CARDS = 5;

var deck = {
	dealHand: function( cardsNeeded ) {
		var hand = []
		for (var i=0; i<cardsNeeded; i++) {
			hand.push(randomState())
		}
		return hand
	}
}

// component should contain a hyphen for use as custom tag in DOM...
Vue.component('player', {
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
	template: `
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
	`
})

Vue.component('pawn', {
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
	template: `<div class="pawn" :title="name" :style="styleObject">{{location}}</div>`
})

// TODO: use vue-draggable here
Vue.component('card', {
	props: ['location','abbrev','name'],
	data: function() {
		return {
			highlighted: false
		}
	},
	computed: {
		adjacent: function() {
			return stateInfo[this.location].neighbors.includes(this.abbrev)
		}
	},
	methods: {
	},
	template: `
		<span @click="handleClick"
			  v-bind:class="{ adjacent: adjacent }"
		>
			{{abbrev}}
		</span>
	`
})

vueapp = new Vue({
	el: '#app',
	data: {
		showInstructions: false,
		turnNumber: 0,
		gameRound: 0, // game hasn't begun
		currentPlayer: 2,
		cardsDiscarded: 0,
		cardsRemaining: 0,
		distance: 300, // rename this, give more meaningful value
		players: [
			{ id: 0, name: "Melvin", automated: true, token: "#token1", color: '#f88', location: "OH" },
			{ id: 1, name: "You", automated: false, token: "#token2", color: '#8f8', location: "OH" },
			{ id: 2, name: "Priscilla", automated: true, token: "#token3", color: '#88f', location: "OH" }
		],
	},
	computed: {
		player: function() {
			return this.players[this.currentPlayer]
		}
	},
	created: function() {
		for( player of this.players ) {
			player.location = randomState();
			// player.objective = this.setMission( this.distance );
			player.objective = randomState();
			// if(!players[p].automated) {
			// 	players[p].setDroppables();
			// }
		}
	},
	mounted: function() {
		this.startTurn()
	},
	methods: {
		removeCard: function(cardName) {
			console.log('removing card',cardName)
			console.log(this.player.cards)
			cardIndex = this.player.cards.indexOf(cardName)
			if( cardIndex >= 0 ) {
				this.player.cards.splice(cardIndex,1)
				this.nextPlayer()
			} else {
				console.log('card not found in hand')
			}
		},
		startTurn: function() {
			console.log('turn for', this.currentPlayer)
		},
		setLocation: function() {
			return 'AK'
		},
		setMission: function() {
			return 'MO'
		},
		nextPlayer: function() {
			this.currentPlayer += 1;
			this.turnNumber += 1;
			if (this.currentPlayer == this.players.length) {
				this.currentPlayer = 0;
				this.gameRound += 1;
			}
			this.startTurn();
		}
	}
})

// vueapp.nextPlayer();
