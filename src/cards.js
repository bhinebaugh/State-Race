import { randomState } from './states.js'

export const MAX_CARDS = 5

export const deck = {
	dealHand: function( cardsNeeded ) {
		var hand = []
		for (var i=0; i<cardsNeeded; i++) {
			hand.push(randomState())
		}
		return hand
	}
}
