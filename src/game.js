KickShot.Game = function(game) {

};

KickShot.Game.prototype = {
    create: function() {
        var pos = worldToScreen({x: 0, y: 0});
        this.add.sprite(pos.x, pos.y, 'field');
    },

    update: function() {

    }
}
