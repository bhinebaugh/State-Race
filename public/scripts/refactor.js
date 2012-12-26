/*
 -  # State Race #
 -  Kent Hinebaugh, Jason Hinebaugh, Brian Glusman
 -  MIT license or something?
*/
 
//  Stuff for JSLint:
/*jslint browser: true, nomen: false */
/*globals _, $, jQuery, Backbone */
 
var Nation, State,              // Backbone Models
    NationMapView, StateMapView,   // Backbone Views
    state, usa,                 // Instances
    StateDefaults;              // Defined elsewhere
/*  
 -  NOTE: These probably shouldn't be global variables. Rather,
 -  they should be wrapped in an IIFE.
*/ 


/*  ## Models ##  */

/*
 -  ### State ###
 -
 -  A state is both a location on the board and a card in the deck. Those are
 -  just two views of the same model. Unless the deck has more than one of each
 -  state, in which caase we're screwed.
*/
State = Backbone.Model.extend({
/*
 -  The only thing to intitialize is to set the parent nation. Note: that sounds 
 -  like something backbone might already handle?
*/
    initialize: function (attributes, options) {
        this.set({parent_nation: attributes.parent_nation});
    },
    setup: function () {
/*
 -  The neighbors attribute is initially given as a list of id strings. Setup uses 
 -  those ids to look up the states from the parent Nation object and replace the
 -  id strings with actual State objects.
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
 -  The following code is copied from the original version. The catch here is that the
 -  states were initialized with movesTo set to 999, which serves to tell the shortest
 -  path algorithm that the shortest movesTo value has not yet been calculated.
//storing initial graph distances for floyd's calculations
_.each(stateObjects, function(state) {
	_.each(state.neighbors(), function (neighbor) {
 -
 -  Set the distance between each state and its neighbor to one step
 -
		state.setDist(neighbor, 1);
		neighbor.setDist(state, 1);
	})
})

//Floyd's shortest path calculation
_.each(stateObjects, function(interState) {
	_.each(stateObjects, function(state1) {
		_.each(stateObjects, function(state2) {
 -
 -  For each state, select every other pair of states and determine which is shorter:
 -  a) the previously calculated number of steps between them, or
 -  b) the number of steps to travel through the current state
 -
			var min = Math.min(
				state1.movesTo(state2), 
				(state1.movesTo(interState) + interState.movesTo(state2)) 
				// Doesn't the second argument evaluate to true instead of a number?
			);
 -  Set the new shortest path between those states
			state1.setDist(state2, min);
			state2.setDist(state1, min);
		})
	})
})
*/


});

/*
 -  ### Nation ###
 -
 -  A collection of states. This is the definitive resource that always contains
 -  exactly one instance of each state. States may belong in the draw pile, discard
 -  pile, or players' hands, but they are always accessible through their Nation.
*/
Nation = Backbone.Collection.extend({
    model: State,
/*
 -  The nation is responsible for loading and setting up its states. Setup can
 -  only happen after the entire collection is loaded, because it requires each
 -  state to already know its neighbor states and for all neighbors to be accessible
 -  via the parent_nation.
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
    }
});

/*  ## Views ##  */

/*
 -  ### Nation Map View
 -  
 -  This serves as the main game board. Coordinates are defined in latitutde and
 -  longitude and translated on screen based on the map view's scale attribute. The
 -  bounds of the map are established by the bottom, left, right, and top properties,
 -  which would change if the map was repositioned within the view.
*/
NationMapView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nation-map',
    scale: 10,
    bounds: {
        bottom: 23.079732,
        left: -125.712894,
        right: -65.419925,
        top: 49.267805
    },
/*
 -  The map view loops through its collection's State models and renders each one,
 -  providing a parent_map parameter so that the StateView can figure out its scale
 -  and position relative to the parent map's bounds.
*/
    render: function () {
        var parent_view = this;
        this.collection.each(function (state) {
            var stateView = new StateMapView({
                model: state,
                id: 'state-map-' + state.get('id')
            });
            $('body').prepend(stateView.el);
            stateView.render(parent_view);
/*
 -  It really seems like there should be a way to designate child views from a collection,
 -  so that a reference to parent_view didn't have to be passed this way. It just feels clunky.
*/
        });
    }
});

StateMapView = Backbone.View.extend({
    tagName: 'li',
    className: 'state-map',
    template: _.template("<b><%= id %>:</b> <%= capital %>"),
    render: function (parent_view) {
        var x, y;
        x = Math.floor(parent_view.scale * (this.model.get('longitude') - parent_view.bounds.left));
        y = Math.floor(parent_view.scale * (parent_view.bounds.top - this.model.get('latitude')));
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.css({
            left: x,
            position: 'absolute',
            top: y
        })
        return this;
    }
})


usa = new Nation;
usaMap = new NationMapView({
    collection: usa,
    id: 'nation-map-' + usa.id
}).render();
