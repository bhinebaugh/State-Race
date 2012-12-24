var Map, State, StateView, TheUSA,
    state, usa;

Map = {
    bottom: 23.079732,
    left: -125.712894,
    right: -65.419925,
    scale: 10,
    top: 49.267805
}

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

Nation = Backbone.Collection.extend({
    model: State,
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

usa = new Nation;
usa.each(function (state) {
    var stateView = new StateMapView({
        model: state,
        id: 'state-map-' + state.get('id')
    });
    $('body').prepend(stateView.el);
    stateView.render();
});
