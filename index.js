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



// component should contain a hyphen for use as custom tag in DOM...




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
