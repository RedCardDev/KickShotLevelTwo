KickShot.Game = function(game) {

};

KickShot.Game.prototype = {
    create: function() {
        console.log(this.game.canvas.style.width);
        console.log(this.game.canvas.style.height);

        this.add.sprite(0, 0, 'field');
    },

    update: function() {

    }
}
