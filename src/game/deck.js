game.module(
    'game.deck'
).body(function() {

game.createClass('Deck', {
   
    offenseSubDeck: null,
    defenseSubDeck: null,
    deck: null,
    top6Cards: null,

    // These arrays hold how many of each type of card will appear in the decks
    homeOffenseCards: [
        {name: "Pass", count: 7},
        {name: "Shot Right", count: 2},
        {name: "Shot Left", count: 2}
    ],

    homeDefenseCards: [
        {name: "Intercept", count: 1},
        {name: "Goal Block Left", count: 2},
        {name: "Goal Block Right", count: 2}
    ],

    awayOffenseCards: [
        {name: "Pass", count: 8},
        {name: "Shot Right", count: 5},
        {name: "Shot Left", count: 5}
    ],

    awayDefenseCards: [
        {name: "Intercept", count: 5},
        {name: "Goal Block Left", count: 4},
        {name: "Goal Block Right", count: 4}
    ],



    init: function(side) {
        console.log("Creating deck for " + side + " side...");
        this.buildDeck(side);
    },

    // Creates deck that is shuffled and has proper 6 cards on top for player's initial hand
    buildDeck: function(side) {
        this.deck = [];
        this.offenseSubDeck = [];
        this.defenseSubDeck = [];
        this.top6Cards = [];
        

        /* Create 2 subdecks (offense and defense cards) */
            side = side.toUpperCase();
            switch (side) {

                case "HOME":
                
                    // Create offense subdeck
                    for(var i = 0; i < this.homeOffenseCards.length; i++)
                    {
                        for(var c = 0; c < this.homeOffenseCards[i].count; c++)
                        {
                            this.offenseSubDeck.push(this.homeOffenseCards[i].name);
                        }
                    }
                    this.offenseSubDeck = this.shuffle(this.offenseSubDeck);

                    // Create defense subdeck
                    for(var i = 0; i < this.homeDefenseCards.length; i++)
                    {
                        for(var c = 0; c < this.homeDefenseCards[i].count; c++)
                        {
                            this.defenseSubDeck.push(this.homeDefenseCards[i].name);
                        }
                    }
                    this.defenseSubDeck = this.shuffle(this.defenseSubDeck);
                    break;
                
                case "AWAY":
                
                    // Create offense subdeck
                    for(var i = 0; i < this.awayOffenseCards.length; i++)
                    {
                        for(var c = 0; c < this.awayOffenseCards[i].count; c++)
                        {
                            this.offenseSubDeck.push(this.awayOffenseCards[i].name);
                        }
                    }
                    this.offenseSubDeck = this.shuffle(this.offenseSubDeck);

                    // Create defense subdeck
                    for(var i = 0; i < this.awayDefenseCards.length; i++)
                    {
                        for(var c = 0; c < this.awayDefenseCards[i].count; c++)
                        {
                            this.defenseSubDeck.push(this.awayDefenseCards[i].name);
                        }
                    }
                    this.defenseSubDeck = this.shuffle(this.defenseSubDeck);
                    break;

                default:
                    console.log("Error creating deck. Please using Deck(\"home\") or Deck(\"away\").");
                    break;
            
            }


        /* Get top six cards for player's starting hand */

            var startingOffCards = 4;
            var startingDefCards = 2;

            // Get 4 random offense cards
            for(var i = 0; i < startingOffCards; i++){
                this.top6Cards.push( this.offenseSubDeck.pop() );
            }

            // Get 2 random defense cards
            for(var i = 0; i < startingDefCards; i++){
                this.top6Cards.push( this.defenseSubDeck.pop() );
            }


        /* Combine subdecks into "deck" */
        
            var dlength = this.defenseSubDeck.length;
            var olength = this.offenseSubDeck.length;

            // Add offense subdeck to "deck"
            for(var i = 0; i < olength; i++)
            {
                this.deck.push(this.offenseSubDeck.pop() );
            }

            // Add defense subdeck to "deck"
            for(var i = 0; i < dlength; i++)
            {
                this.deck.push(this.defenseSubDeck.pop() );
            }

            // Shuffle the deck
            this.deck = this.shuffle(this.deck);

            // Free memory
            this.offenseSubDeck = null;
            this.defenseSubDeck = null;

        /* Add top 6 cards to "deck" */
            var temp = this.top6Cards.length;

            for(var i = 0; i < temp; i++){
                this.deck.push( this.top6Cards.pop() );
            }

            // Free memory
            this.top6Cards = null;

    },


    // Print contents of "deck" for debugging purposes
    printDeck: function() {
        console.log("Printing contents of deck:");

        for(var i = 0; i < this.deck.length; i++)
        {
            console.log("deck[" + i + "]: " + this.deck[i]);
        }
    },

    // Print "offenseSubDeck" and "defenseSubDeck" for debugging purposes
    printSubDecks: function() {
        console.log("Printing contents of offenseSubDeck (length = " + this.offenseSubDeck.length + "):");

        for(var i = 0; i < this.offenseSubDeck.length; i++)
        {
            console.log("deck[" + i + "]: " + this.offenseSubDeck[i]);
        }

        console.log("Printing contents of defenseSubDeck (length = " + this.defenseSubDeck.length + "):");

        for(var i = 0; i < this.defenseSubDeck.length; i++)
        {
            console.log("deck[" + i + "]: " + this.defenseSubDeck[i]);
        }

    },

    // Shuffles an array or stack
    shuffle: function(array) {
        var counter = array.length, temp, index;

        while (counter > 0) {

            index = Math.floor(Math.random() * counter);

            counter--;

            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

            return array;
    }


});

});
