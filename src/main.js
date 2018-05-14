import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

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

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
