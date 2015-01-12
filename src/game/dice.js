game.module(
    'game.dice'
).body(function() {

game.createClass('Dice', {
    rolling: false,
    value1: 1,
    value2: 1,
    timing: false,

    init: function() {
        this.die1 = new game.Sprite('dice1').addTo(game.scene.stage);
        this.die2 = new game.Sprite('dice1').addTo(game.scene.stage);
        this.die1.x = this.die2.x = -50;
        this.die1.anchor.set(0.5, 0.5);
        this.die2.anchor.set(0.5, 0.5);
        this.setPlayerPosition();
    },

    update: function() {
        if (this.rolling && !this.timing) {
            var self = this;
            this.timing = true;
            this.value1 = ~~Math.randomBetween(1, 7);
            this.value2 = ~~Math.randomBetween(1, 7);
            this.die1.setTexture('dice' + this.value1);
            this.die2.setTexture('dice' + this.value2);
            game.scene.addTimer(100, function() {
                self.timing = false;
            });
        }
    },

    show: function() {
        game.scene.addTween(this.die1, {x: 150}, 500, { easing: game.Tween.Easing.Back.Out }).start();
        game.scene.addTween(this.die2, {x: 150}, 500, { easing: game.Tween.Easing.Back.Out }).start();
    },

    hide: function() {
        game.scene.addTween(this.die1, {x: -this.die1.width}, 500, { easing: game.Tween.Easing.Back.In }).start();
        game.scene.addTween(this.die2, {x: -this.die2.width}, 500, { easing: game.Tween.Easing.Back.In }).start();
    },

    roll: function() {
        this.rolling = true;
    },

    stopRoll: function() {
        this.rolling = false;
    },

    setPlayerPosition: function() {
        this.die1.y = game.system.height - 100;
        this.die2.y = game.system.height - 200;
    },

    setAiPosition: function() {
        this.die1.y = 175;
        this.die2.y = 275;
    },

    reset: function() {
        this.value1 = 1;
        this.value2 = 1;
        this.die1.setTexture('dice1');
        this.die2.setTexture('dice1');
    }
});

});
