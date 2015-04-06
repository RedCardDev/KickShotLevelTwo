game.module(
    'game.dice'
).body(function() {

game.createClass('Dice', {
    rolling: false,
    value1: 1,
    value2: 1,
    timing: false,

    init: function() {
        // Create 2 dice
        this.die1 = new game.Sprite('dice1').addTo(game.scene.stage);
        this.die2 = new game.Sprite('dice1').addTo(game.scene.stage);
        this.die1.x = this.die2.x = -50;
        this.die1.anchor.set(0.5, 0.5);
        this.die2.anchor.set(0.5, 0.5);
        this.setBothPositions();
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
        game.scene.addTween(this.die1, {x: 150}, game.DiceHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
        game.scene.addTween(this.die2, {x: 150}, game.DiceHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
    },

    hide: function() {
        game.scene.addTween(this.die1, {x: -this.die1.width}, game.DiceHideSpeed, { easing: game.Tween.Easing.Back.In }).start();
        game.scene.addTween(this.die2, {x: -this.die2.width}, game.DiceHideSpeed, { easing: game.Tween.Easing.Back.In }).start();
    },

    roll: function(whichPlayer) {
        this.rolling = true;

        // Capitalize string so case doesn't matter
        whichPlayer = whichPlayer.toUpperCase();

        // Move dice to the player(s) who will be rolling
        switch(whichPlayer) {
            case "PLAYER 1":
                this.setPlayerPosition();
                console.log("Rolling dice for Player 1...");
                break;
            case "PLAYER 2":
                this.setAiPosition();
                console.log("Rolling dice for Player 2...");
                break;
            case "BOTH":
                this.setBothPositions();
                console.log("Rolling one die for each player...");
                break;
            default : 
                console.log("Error: Can't roll dice for player \"" + whichPlayer + "\". Use \"Player 1\", \"Player 2\", or \"both\".");
                break; 
        }
    },

    stopRoll: function() {
        this.rolling = false;
        console.log("Dice roll ended. Die 1: " + this.value1 + "\n                  Die 2: " + this.value2);
    },

    // Put both dice on Player 1's side
    setPlayerPosition: function() {
        this.die1.y = game.system.height - 100;
        this.die2.y = game.system.height - 200;
    },

    // Put both dice on Player 2's (the computer) side
    setAiPosition: function() {
        this.die1.y = 175;
        this.die2.y = 275;
    },

    // Put one die on Player 1's side and the other die on Player 2's side
    setBothPositions: function() {
        this.die1.y = game.system.height - 100;
        this.die2.y = 175;
    },

    reset: function() {
        this.value1 = 1;
        this.value2 = 1;
        this.die1.setTexture('dice1');
        this.die2.setTexture('dice1');
    }
});

});
