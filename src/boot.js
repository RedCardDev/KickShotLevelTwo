var KickShot = {};

KickShot.Boot = function(game) {};

function worldToScreen(point) {
    if (KickShot.worldRatio > KickShot.deviceRatio) {
        // this means the device is more square than our board, so will have
        // empty space above and below the board
        point.y = point.y + (KickShot.scaleHeight - KickShot.worldHeight) / 2;
    } else {
        point.x = point.x + (KickShot.scaleWidth - KickShot.worldWidth) / 2;
    }
    return point;
};

// this converts a scaled and offset world coordinate into a screen coordinate
function screenToWorld(point) {
    if (KickShot.worldRatio > KickShot.deviceRatio) {
        // this means the device is more square than our board, so will have
        // empty space above and below the board
        point.y = point.y - (KickShot.scaleHeight - KickShot.worldHeight) / 2;
    } else {
        point.x = point.x - (KickShot.scaleWidth - KickShot.worldWidth) / 2;
    }
    return point;
};

KickShot.Boot.prototype = {
    preload: function() {
        this.load.image('loadbar', 'assets/images/progressBar.png');
    },

    create: function() {
        // setup some of the game configuration here
        this.input.maxPointers = 1;

        console.log(KickShot.worldRatio);
        console.log(KickShot.deviceRatio);

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);

        this.state.start('Preload');
    },
};
