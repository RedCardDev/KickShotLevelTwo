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

    //highlightedCard: -1,

    init: function() {

        // Add a sprite to the game for each card
        for(var i = 0; i < this.cards.length; i++){
            this.cards[i].sprite = new game.Sprite(this.cards[i].name).addTo(game.scene.stage);
            this.cards[i].sprite.scale.x = this.cards[i].sprite.scale.y = 0.3;

            this.cards[i].sprite.interactive = true;

            // Click/tap
            //this.cards[i].sprite.click = this.cards[i].sprite.tap = this.clickedCard.bind(this);
            
            // Mouse over
            // this.cards[i].sprite.mouseover = this.mouseOverCard.bind(this.cards[i].sprite);
            this.cards[i].sprite.mouseover = this.mouseOverCard.bind(this);


            // Mouse out
            this.cards[i].sprite.mouseout = this.mouseOutCard.bind(this);
        }


        // Brute force card clicks
        this.cards[0].sprite.click = this.cards[0].sprite.tap = this.clickCard0.bind(this);
        this.cards[1].sprite.click = this.cards[1].sprite.tap = this.clickCard1.bind(this);
        this.cards[2].sprite.click = this.cards[2].sprite.tap = this.clickCard2.bind(this);
        this.cards[3].sprite.click = this.cards[3].sprite.tap = this.clickCard3.bind(this);
        this.cards[4].sprite.click = this.cards[4].sprite.tap = this.clickCard4.bind(this);
        this.cards[5].sprite.click = this.cards[5].sprite.tap = this.clickCard5.bind(this);

    },

    mouseOutCard: function(mousedata) {
        mousedata.target.scale.x = mousedata.target.scale.y = 0.3;
        //mousedata.target.position.y = game.system.height - this.cards[0].sprite.height*0.15;
        mousedata.target.position.y += 500;

    },


    clickCard0: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[0].name + "\" at index [0]");
    },
    clickCard1: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[1].name + "\" at index [1]");
    },
    clickCard2: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[2].name + "\" at index [2]");
    },
    clickCard3: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[3].name + "\" at index [3]");
    },
    clickCard4: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[4].name + "\" at index [4]");
    },
    clickCard5: function(mousedata) { 
        console.log("Clicked card \"" + this.cards[5].name + "\" at index [5]");
    },

    mouseOverCard: function(mousedata) {

        mousedata.target.scale.x = mousedata.target.scale.y = 0.5;
        mousedata.target.position.y -= 500;
		
		
		// These numbers will have to be adjusted if card size is adjusted.
		// if (mousedata.target.position.x <= 50)
		// 	console.log("1");
		// else if (mousedata.target.position.x <= 100)
		// 	console.log("2");
		// else if (mousedata.target.position.x <= 200)
		// 	console.log("3");
		// else if (mousedata.target.position.x <= 250)
		// 	console.log("4");
		// else if (mousedata.target.position.x <= 350)
		// 	console.log("5");
		// else
		// 	console.log("6");
    },

  //   clickedCard: function(mousedata){
  //       console.log("clicked card: ");
  //       mousedata.target.setTexture("Intercept_Home");

		// if (mousedata.target.position.x <= 50)
		// 	console.log("1");
		// else if (mousedata.target.position.x <= 100) {
		// 	console.log("2");
  //           //console.log("card's name is: " + this.cards[1].name);
  //       }
		// else if (mousedata.target.position.x <= 200)
		// 	console.log("3");
		// else if (mousedata.target.position.x <= 250)
		// 	console.log("4");
		// else if (mousedata.target.position.x <= 350)
		// 	console.log("5");
		// else
		// 	console.log("6");
  //   },


   
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



    isPlayable: function(cardName, currentTurn, currentPossession, ballZone) {
        switch (cardName) {
            //Todo: Add away card
            case("Intercept_Home"):
                console.log("checking Intercept_Home card....\n\n");
                break;
        }
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
