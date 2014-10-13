game.module(
    'game.main'
).require(
    'engine.scene'
)
.body(function() {

game.addAsset('logo.png');
game.addAsset('images/blank_field.png', 'field');
game.addAsset('images/ballchiphome.png', 'chip-home');
game.addAsset('images/ballchipaway.png', 'chip-away');
game.addAsset('images/kickshotbig.png', 'title');

game.createScene('Main', {
    backgroundColor: 0xb9bec7,
    title: null,

    init: function() {
        this.title = new game.Sprite('title').addTo(this.stage);
        this.title.x = game.system.width / 2 - this.title.width / 2 + 10;
        this.title.y = -this.title.height;

        this.addTween(this.title, {y: 130}, 800, {delay: 100, easing: game.Tween.Easing.Back.Out}).start();
    },

    mouseup: function() {
        var self = this;
        this.addTween(this.title, {y: -this.title.height}, 400,
            {   delay: 50,
                easing: game.Tween.Easing.Back.In,
                onComplete: function() {
                    game.system.setScene('Game');
                }
            }).start();
    }
});

game.createScene('Game', {
    backgroundColor: 0xb9bec7,
    chipZone: 0,

    init: function() {
        var field = new game.Sprite('field').addTo(this.stage);
        field.x = 0;
        field.y = -field.height;
        this.addTween(field, {y: 0}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        var chiphome = new game.Sprite('chip-home').addTo(this.stage);
        chiphome.scale.x = chiphome.scale.y = 0.7;
        chiphome.center();
        chiphome.y = -field.height/2 - (chiphome.height / 2);
        this.addTween(chiphome, {y: game.system.height / 2 - chiphome.height / 2}, 600,
            {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        var chipaway = new game.Sprite('chip-away').addTo(this.stage);
        chipaway.scale.x = chipaway.scale.y = 0.7;
        chipaway.visible = false;
    }
});

});
