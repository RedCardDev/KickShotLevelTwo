game.module(
    'game.cardMenu'
).body(function() {

game.createClass('CardMenu', {

    cards: [
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null}
        ],


    init: function() {

        // Add a sprite to the game for each card
        for(var i = 0; i < this.cards.length; i++){
            this.cards[i].sprite = new game.Sprite(this.cards[i].name).addTo(game.scene.stage);
            this.cards[i].sprite.scale.x = this.cards[i].sprite.scale.y = 0.3;

            this.cards[i].sprite.interactive = true;

            // Click/tap
            this.cards[i].sprite.click = this.cards[i].sprite.tap = this.clickedCard.bind(this.cards[i].sprite);
            
            // Mouse over
            this.cards[i].sprite.mouseover = this.mouseOverCard.bind(this.cards[i].sprite);

            // Mouse out
            this.cards[i].sprite.mouseout = this.mouseOutCard.bind(this.cards[i].sprite);
        }

    },

    mouseOutCard: function(mousedata) {
        mousedata.target.scale.x = mousedata.target.scale.y = 0.3;
        //mousedata.target.position.y = game.system.height - this.cards[0].sprite.height*0.15;
        mousedata.target.position.y += 500;
    },

    mouseOverCard: function(mousedata) {
        //console.log("Mousing over card at (" + mousedata.global.x + "," + mousedata.global.y + ")");
        mousedata.target.scale.x = mousedata.target.scale.y = 0.5;
        mousedata.target.position.y -= 500;
    },

    clickedCard: function(mousedata){
        console.log("clicked card");
        //console.log("event target: " + mousedata.global.x);
    },
   
    // Update the cards to match cards in hand
    updateCards: function(cardsInHand) {

        if(cardsInHand.length == 0){
            console.log("No cards in hand! CardMenu will be empty");
            return;
        }

        // Update names and sprites in "cards"
        // Todo: update all 6 cards
        for(var i = 0; i < cardsInHand.length; i++){
            this.cards[i].name = cardsInHand[i];
            this.cards[i].sprite.setTexture( this.cards[i].name );
        }

        // Todo: check for number of cards in hand if less than 6
        for(var i = 0; i < 6; i++) {
            this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - this.cards[i].sprite.height*0.1);
            
            //this.cards[i].sprite.position.set( (((game.system.width/ (this.cards.length+2) )*5 + this.cards[i].sprite.width)/this.cards.length) * i, game.system.height - this.cards[i].sprite.height*0.15);

        }

        this.printCards();
    },
    
    show: function() {
        // Show the card menu
    },

    
    hide: function() {
        // Hide the card menu
    },

    enlargeCard: function() {
        // Enlarge a card for inspection
    },

    

    // Print names of cards in console for debugging
    printCards: function() {
        console.log("Printing contents of \"cards\" in CardMenu...");
        for(var i = 0; i < this.cards.length; i++){
            console.log("cards[" + i + "]: " + this.cards[i].name );
        }
    }

});

});
