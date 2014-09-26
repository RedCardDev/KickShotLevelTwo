var KickShot = {};

KickShot.Boot = function(game) {};

KickShot.Boot.prototype = {
    preload: function() {
        this.load.image('loadbar', 'assets/images/progressBar.png');
    },

    create: function() {
        // setup some of the game configuration here
        this.input.maxPointers = 1;

        KickShot.GAME_WIDTH = 960;
        KickShot.GAME_HEIGHT = 640;

        // TODO: if we need game scaling, it should go here
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);

        this.state.start('Preload');
    }
};
