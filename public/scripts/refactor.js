/*jslint browser: true */
/*globals _, $, jQuery, Backbone */

var Nation, State,      // Backbone Models
    Map, StateView,     // Backbone Views
    state, usa;         // Instances
/*  
 -  NOTE: These probably shouldn't be global variables. Rather,
 -  they should be wrapped in an IIFE.
*/ 


/*  ## Models ##  */

/*
 -  ### State ###
 -  A state is both a location on the board and a card in the deck.
*/
State = Backbone.Model.extend({
    initialize: function (attributes, options) {
        this.set({parent_map: attributes.parent_map});
    },
    setup: function () {
        var map = this.get('parent_map');
        this.set({
            neighbors:  _(this.get('neighbors')).map(function (name) {
                return map.get(name);
            })
        });
    },
    is_neighbor: function (state) {
        return _.contains(this.get('neighbors'), state);
    }
});

/*
 -  ### Nation
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
                parent_map: this,
                neighbors: []
            });
            state.setup(); 
        });
    }
});

/*  ## Views ##  */

NationMapView = {
    bottom: 23.079732,
    left: -125.712894,
    right: -65.419925,
    scale: 10,
    top: 49.267805
}

StateMapView = Backbone.View.extend({
    tagName: 'li',
    className: 'state-map',
    template: _.template("<b><%= id %>:</b> <%= capital %>"),
    render: function () {
        var x, y;
        x = Math.floor(Map.scale * (this.model.get('longitude') - Map.left));
        y = Math.floor(Map.scale * (Map.top - this.model.get('latitude')));
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
usa.each(function (state) {
    var stateView = new StateMapView({
        model: state,
        id: 'state-map-' + state.get('id')
    });
    $('body').prepend(stateView.el);
    stateView.render();
});
