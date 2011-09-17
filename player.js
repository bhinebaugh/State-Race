/* Intended player HTML:
	<div id="player-template" class="player-info">
		<p class="name">(player name)</p>
		<p>Mission: <span class="objective"></span></p>
		<p>Position: <span class="location"></span><span class="destination">Travel to...</span></p>
		<p>Cards</p>
		<div class="cardsinhand">
			<div class="cards"></div>
		</div>
		<div class="discards"><p>Drag unwanted cards here</p></div>
	</div>
*/

/*** the Player object ***/
function Player(name, nonhuman, pawnid) {
	this.name = name;
	this.automated = nonhuman;
	/*
	if( !this.automated ) {
		this.playerdiv.find('.discards').append(newCardsButton);
		$(this.playerdiv).addClass('human');
	}
	*/
	this.pulsing;
	
	this.icon = $(pawnid);
	this.location;
	this.objective;
	this.points = 0;
	this.hand = new Array(); // hand has been replaced by cards
	this.cards = new Array(); // contains cards as DOM elements
	
	var playerdiv;
	this.buildHTML =  function() {
		$('#players').append('<div id="' + name + '" class="player-info">'
			+ '<p class="name">(player name)</p>'
			+ '<p>Mission: <span class="objective"></span></p>'
			+ '<p class="position-display">Position:</p>'
			+ '<div class="destination"><span class="location"></span>'
			+ '<span class="destination-note">Drag new state here</span></div>'
			+ '<p>Cards</p>'
			+ '<div class="cardsinhand">'
			+ '<div class="cards"></div>'
			+ '</div>'
			+ '<div class="discards"><p>Drag unwanted cards here</p></div>'
			+ '</div>');
		return $('#' + name);
	};
	this.playerdiv = this.buildHTML();
	
	this.nameDiv = this.playerdiv.find('.name')[0];
	$(this.nameDiv).html(name);
	this.playerdiv.append(newCardsButton);
	
	this.startTurn = function() {
		this.pulse();
		// Identify path options
		// Play a card
		// Discard
	}
	
	this.pulse = function() {
		thisObj = this;
		if (this.playerdiv.hasClass('start')) {
			this.playerdiv.removeClass('start');
			this.playerdiv.addClass('end');
		} else {
			this.playerdiv.addClass('start');
			this.playerdiv.removeClass('end');
		}
		this.pulsing = setTimeout(function() {thisObj.pulse();}, 750);
	}
	
	this.endTurn = function() {
		this.playerdiv.removeClass('end').removeClass('start');
		clearTimeout(this.pulsing);
		// Various other cleanup tasks;
	}
	
	this.setLocation = function(newLocation) {
		this.location = newLocation;
		this.playerdiv.find('.location')[0].innerHTML = this.location;
		this.icon.css({
			'left': stateObjects[this.location].position[0],
			'top': stateObjects[this.location].position[1],
			'position': 'absolute'
		});
	}
	this.calcDistance = function( state ) {
		var otherLoc = stateObjects[state].position;
		var myLoc = stateObjects[this.location].position;
		return Math.abs(myLoc[0]-otherLoc[0]) + Math.abs(myLoc[1]-otherLoc[1]);
	}

	this.setMission = function( distance ) {
		var minDiff = 10000;
		var currMin = randomState();
		for (var state in stateObjects) {
			diff = Math.abs(this.calcDistance(state) - distance);
			if(diff < minDiff) {
				minDiff = diff;
				currMin = state;
			}
		}
		this.objective = currMin;
		this.playerdiv.find('.objective')[0].innerHTML = "Visit "+stateObjects[currMin].name + " ("+currMin+")";
	}
	this.setDroppables = function() {
		console.log("set droppables for "+this.name);
		var myDiv = this.playerdiv;
		var meObj = this;
		myDiv.find('.cards').droppable({
			//if cards are dragged back, remove the unwanted class
			drop: function( event, ui ){ ui.draggable.removeClass('unwanted') }
		});
		myDiv.find('.destination').droppable({
			activeClass : "destination-drop",
			hoverClass : "destination-over",
			accept :  ".adjacent",
			drop : function( event, ui ) {
				meObj.playCard(ui.draggable);
			}
		});
		myDiv.find('.discards').droppable({
			drop : function( event, ui ) {
				console.log(ui.draggable.prop('innerHTML') + " was dropped on "+$(this).attr('class'));
				// register the card on to discard later / at end of turn
				ui.draggable.addClass('unwanted');
				// change text and binding of  discard button
				//$('.allcardsbtn').bind('click', jQuery.proxy(meObj, "switchCards") );
				myDiv.find('.discards .or').hide();
				myDiv.find('.allcardsbtn').html("Discard the cards above");
				// the line below won't bind 'this' to switchCards the way switchAllCards does later, b/c inside jquery scope?
				myDiv.find('.allcardsbtn').unbind().bind('click', $.proxy(meObj.switchCards, meObj) );
			}
		});
		myDiv.find('.discards .or').show();
		myDiv.find('.allcardsbtn').html("Exchange all cards").unbind().bind('click', $.proxy(this.switchAllCards, this ) );
	};
	this.redrawHand = function() { // deprecate this function
		var handspan = '';
		var meObj = this;
		var myDiv = "#"+this.name;
		var bordering = states[ this.location ].borders;
		var startspan = "";
		for( var i =0; i<this.hand.length; i++ ) {
			if( bordering.indexOf(this.hand[i]) == -1 )  {
				startspan = "<span class='cardbtn'>";
			} else {
				startspan = "<span class='cardbtn adjacent'>";
			}
			handspan += startspan+this.hand[i]+"</span>";
		}
		$(this.playerdiv).find('.cards').html(handspan);
		$(myDiv + ' .cardbtn').draggable({ containment: myDiv, revert: "invalid" });
	} 
	this.markAdjacentCards = function( cardArray ) {
		if( cardArray instanceof Array) {
			$.each( cardArray, $.proxy( 
				function( index, cardDOM ) {
					var cardObj = $(cardDOM);
					if(stateObjects[cardObj.html()].movesTo(stateObjects[this.location]) == 1) {
						cardObj.addClass('adjacent');
					} else {
						cardObj.removeClass('adjacent');
					}
				}, this )
			)
		}
	}
	this.addCard = function( stateAbbrev ) {
		var cardDiv = $( cardTmpl );
		cardDiv.html( stateAbbrev );
		this.markAdjacentCards( [cardDiv] ); // pass in as a single-element array
		if(!this.automated) {
			cardDiv.draggable({ containment: "#"+this.name, revert: "invalid" });
		}
		this.cards.push( cardDiv[0] );
		$(this.playerdiv).find('.cards').append(cardDiv);
	}
	this.dealHand = function( cardsNeeded ) {
		for (var i=0; i<cardsNeeded; i++) {
			this.addCard(randomState());
		}
		//this.redrawHand();
		if(!this.automated) this.setDroppables();
	}
	this.switchAllCards = function() {
		var numberOfCards = this.cards.length;
		this.cards = [];
		$(this.playerdiv).find('.cards').empty();
		this.dealHand(numberOfCards);
		//this.redrawHand();
	}
	this.switchCards = function() {
		console.log("switchCards ... cards length "+this.cards.length);
		var h = this.cards;
		var cardsLost = 0;
		var cardsKept = new Array();
		$.each( h, function( index, cardDOM ) {
			var card = $(cardDOM);
			var discardtest = "considering "+card.html();
			if( card.hasClass('unwanted') ) {
				discardtest += " ... unwanted";
				card.remove();
				cardsLost++;
				//h.splice( index, 1 );
			} else { 
				discardtest += " ... retain";
				cardsKept.push(card);
			}
			console.log(discardtest);
		});
		this.cards = cardsKept;
		// animate cards leftward into any empty spaces created by discards
		this.dealHand(cardsLost);
	}
	this.playCard = function( targetDOMList ) {
		var targetDOM = targetDOMList[0];
		var target = targetDOM.innerHTML;
		console.log(targetDOM);
		console.log(targetDOM.innerHTML);
		//var cardPlayed = this.cards[ the one that matches target ]
		if ( stateObjects[target].movesTo(stateObjects[this.location]) === 1 ) {
			console.log("traveling to "+target);
			this.cards.splice( this.cards.indexOf(targetDOM), 1 );
			this.setLocation( target );
			$(targetDOM).remove();
			// mark cards whose states are adjacent to the new location
			this.markAdjacentCards( this.cards );
			$('#ranking').html(ranking());
			//this.checkVictory(); //handled outside player object now?
			// animate cards consolide left, new card slides in from right
			this.addCard( randomState() );
			//this.redrawHand();
		} else {
			console.log(target + " is not adjacent to " + this.location);
			// revert card to original postion through 'revert' property on .draggable()
		}
	}
}
