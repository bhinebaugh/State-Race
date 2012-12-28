/*
 *  # State Race #
 *  Kent Hinebaugh, Jason Hinebaugh, Brian Glusman
 *  MIT license or something?
*/
 
//  Stuff for JSLint: (And yes, it _has_ to be formatted that way.)
/*jslint browser: true, nomen: false */
/*globals _, $, jQuery, Backbone */
 
var Nation, Player, State,                                // Backbone Models
    NationMapView, StateCardView, StateMapView,           // Backbone Views
    discard, draw, state, adam, usa,                      // Instances
    StateDefaults;                                        // Defined elsewhere
/*  
 *  NOTE: These probably shouldn't be global variables. Rather, they should be 
 *  wrapped in an IIFE. __Actually__, the overall structure is of course still
 *  changing, but it's looking like all of these models and views make sense to
 *  declare within a single global Game model declaration. That way there's only
 *  one global variable introduced, and everything is still available within
 *  the context of the game.
*/ 


/*  ## Models ##  */

/*
 *  ### State ###
 *
 *  A state is both a location on the board and a card in the deck. Those are
 *  just two views of the same model. Unless the deck has more than one of each
 *  state, in which caase we're screwed.
*/
State = Backbone.Model.extend({
/*
 *  The only thing to intitialize is to set the parent nation. Note: that sounds 
 *  like something backbone might already handle?
*/
    initialize: function (attributes, options) {
        this.set({parent_nation: attributes.parent_nation});
    },
    setup: function () {
/*
 *  The neighbors attribute is initially given as a list of id strings. Setup uses 
 *  those ids to look up the states from the parent Nation object and replace the
 *  id strings with actual State objects.
*/
        this.set({
            neighbors:  _(this.get('neighbors')).map(function (state_id) {
                return this.get('parent_nation').get(state_id);
            })
        });
    },
    is_neighbor: function (state) {
        return _(this.get('neighbors')).contains(state);
    },
    shortest_path_to: function (state) {
        $.noop();  
    } 
/*
 *  The following code is copied from the original version. The catch here is that the
 *  states were initialized with movesTo set to 999, which serves to tell the shortest
 *  path algorithm that the shortest movesTo value has not yet been calculated.
//storing initial graph distances for floyd's calculations
_.each(stateObjects, function(state) {
	_.each(state.neighbors(), function (neighbor) {
 *
 *  Set the distance between each state and its neighbor to one step
 *
		state.setDist(neighbor, 1);
		neighbor.setDist(state, 1);
	})
})

//Floyd's shortest path calculation
_.each(stateObjects, function(interState) {
	_.each(stateObjects, function(state1) {
		_.each(stateObjects, function(state2) {
 *
 *  For each state, select every other pair of states and determine which is shorter:
 *  a) the previously calculated number of steps between them, or
 *  b) the number of steps to travel through the current state
 *
			var min = Math.min(
				state1.movesTo(state2), 
				(state1.movesTo(interState) + interState.movesTo(state2)) 
				// Doesn't the second argument evaluate to true instead of a number?
			);
 *  Set the new shortest path between those states
			state1.setDist(state2, min);
			state2.setDist(state1, min);
		})
	})
})
*/

});

/*
 *  ### Hand ###
 *
 *  A hand is a collection of states.
*/ 
Hand = Backbone.Collection.extend({
    model: State,
});

/*
 *  ### Player ###
 *
 *  A human player of the game.
*/
Player = Backbone.Model.extend({
    defaults: {
        name: 'Player',
        human: true
    },
    initialize: function (attributes, options) {
        this.set('hand', new Hand());
        this.set('played', new Hand());
    },
    draw: function (number) {
        var i, hand = this.get('hand');
        hand.add(this.get('game').draw(number));
        return this;
    }
});

/*
 *  ### Nation ###
 *
 *  A collection of states. This is the definitive resource that always contains
 *  exactly one instance of each state. States may belong in the draw pile, discard
 *  pile, or players' hands, but they are always accessible through their Nation.
*/
Nation = Backbone.Collection.extend({
    model: State,
/*
 *  The nation is responsible for loading and setting up its states. Setup can
 *  only happen after the entire collection is loaded, because it requires each
 *  state to already know its neighbor states and for all neighbors to be accessible
 *  via the parent_nation.
*/
    initialize: function (attributes, options) {
        this.add(StateDefaults);
        _.each(this.models, function (state) {
            state.set({
                parent_nation: this,
                neighbors: []
            });
            state.setup(); 
        });
    },
});

/*
 *  ### Game ###
 *
 *  Finally, a model to house the whole game. All of the functions for game setup and
 *  gameplay should route through here.
*/
Game = Backbone.Model.extend({
    initialize: function (attributes, options) {
        var Players = Backbone.Collection.extend({ // A Collection defined only in another model? Weird. 
            model: Player
        });
        this.set('players', new Players());
        if (attributes.nation) { // Must be initialized with a Nation for generating the draw pile.
            this.set('draw', new Hand(attributes.nation.shuffle()));
            this.set('discard', new Hand());
        }
    },
    add_player: function (attributes, options) {
        var player = new Player(attributes, options);
        player.set('game', this);
        this.get('players').add(player.toJSON());
    },
    draw: function (number) {
        var set = []; // A vanilla Array because that's what a Colleciton needs for raw input
        while (set.length < number && this.get('draw').length >= number) {
            set.push(this.get('draw').pop().toJSON());
        }
        return set;
    },
/*
 *  This includes all of the setup required before gameplay is handed off to the first player.
 *  So far, it just deals seven cards to each player.
*/
    start: function () {
        this.get('players').each(function (player) {
            player.draw(7); 
        });
    }
});


/*  ## Views ##  */

/*
 *  ### Nation Map View ###
 *  
 *  This serves as the main game board. Coordinates are defined in latitutde and
 *  longitude and translated on screen based on the map view's scale attribute. The
 *  bounds of the map are established by the bottom, left, right, and top properties,
 *  which would change if the map was repositioned within the view.
*/
NationMapView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nation-map span12',
    scale: 10,
    bounds: {
        bottom: 23.079732,
        left: -124.212894,
        right: -65.419925,
        top: 49.267805
    },
    height: function () {
        return this.bounds.top - this.bounds.bottom;
    },
    width: function () {
        return this.bounds.right - this.bounds.left;
    },
/*
 *  The map view loops through its collection's State models and renders each one, providing
 *  a parent_map parameter so that the StateView can figure out its scale and position relative
 *  to the parent map's bounds.
 *
 *  NOTE: It really seems like there should be a way to designate child views from a collection,
 *  so that a reference to parent_view didn't have to be passed this way. It just feels clunky.
*/
    render: function () {
        var parent_view = this;
        this.collection.each(function (state) {
            var state_view = new StateMapView({
                model: state,
                id: 'state-map-' + state.get('id')
            });
            state_view.render(parent_view);
            parent_view.$el.append(state_view.$el);
        });
        this.$el.height($('#board').width() * this.height() / this.width())
        return this;
    }
});

/*
 *  ### State Map View ###
 *
 *  This view of each state belongs to the nation map. It draws the state on the map and can
 *  change the drawing style to reflect the state's current status in the game.
*/
StateMapView = Backbone.View.extend({
    tagName: 'li',
    className: 'state-map',
    template: $('#state-map-view'),
    render: function (parent_view) {
        var x, y;
        x = 100 * (this.model.get('longitude') - parent_view.bounds.left) / parent_view.width();
        y = 100 * (parent_view.bounds.top - this.model.get('latitude')) / parent_view.height();
        this.$el.html(this.template.html());
        this.$('.state-id').attr({title: this.model.get('name')}).text(this.model.get('id'));
        this.$el.css({
            left: x + '%',
            top: y + '%'
        })
        return this;
    }
});

/*
 *  ### Hand View ###
 *
 *  This view represents a collection of cards, which could be an entire deck, or a
 *  discard or draw pile, or a player's hand (or played "trick" of cards).
 *
*/
HandView = Backbone.View.extend({
    tagName: 'ul',
    className: 'card card-hand',
    render: function () {
        var $hand = this.$el;
        this.collection.each(function (state) {
            var state_view = new StateCardView({
                model: state
            }).render();
            $hand.append(state_view.$el);
        });
        return this;
    }
});

/*
 *  ### State Card View ###
 *
 *  The view of a state when being referenced in the context of cards, which could be anywhere,
 *  but are conventionally inside a Hand View.
*/
StateCardView = Backbone.View.extend({
    tagName: 'li',
    className: 'card card-state',
    template: $('#state-card-view'),
    render: function () {
        this.$el.html(this.template.html());
        this.$('.state-id').attr({title: this.model.get('name')}).text(this.model.get('id'));
        return this;
    }
});

/*
 *  ### Player View ###
 *
 *  The player has a name and a hand, so that's what's shown for each player in the list of
 *  players. The list itself is part of the Game View, which is an odd instance of needing
 *  a subview only for a very constrained use case.
*/
PlayerView = Backbone.View.extend({
    tagName: 'div',
    className: 'player span3',
    template: $('#player-view'),
    render: function () {
        var hand_view = new HandView({
            collection: this.model.get('hand')
        }).render();
        this.$el.html(this.template.html());
        this.$('.player-name').text(this.model.get('name')).after(hand_view.$el);
        return this;
    }
});

/*
 *  ### Game View ###
 *  The only thing this view isn't responsible for rendering and adding to the DOM are the
 *  main container div and two special divs #board and #players, which this view uses to
 *  target locations for the nation map view and player list views, respectively.
*/
GameView = Backbone.View.extend({
    tagName: 'div',
    className: 'game-container',
    render: function () {
        var map_width, nation_view, parent_game, players_view;
        parent_game = this;
        nation_view = new NationMapView({
            collection: this.model.get('nation')
        });
        map_width = nation_view.bounds.right - nation_view.bounds.left;
        nation_view.scale = $('#board').width() / map_width;
        nation_view.render();
        this.model.get('players').each(function(player) {
            var player_view = new PlayerView({
                model: player
            })
            player_view.render();
            $('#players').append(player_view.$el);
        });
        $('#board').html(nation_view.$el);
    }
});

/*
 *  ## Instantiation and Kickoff ##
 *
 *  This stuff should really be condensed so that there's a single function call to the game
 *  that kicks things off and then hands control over to the user.
*/
usa = new Nation();
usaMap = new NationMapView({
    collection: usa,
    id: 'nation-map-' + usa.id
});

game = new Game({
    nation: usa
})
game.add_player({
    name: 'Anna'
});
game.add_player({
    name: 'Bridget'
});
game.add_player({
    name: 'Camille'
});
game.add_player({
    name: 'Darla'
});
game.start();
game_view = new GameView({
    model: game,
    id: 'game-container'
}).render();
