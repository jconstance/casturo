var Game = function () {
    this.playerLookup = {};
    this.players = [];
    this.nodes = [];
    this.board = [];
    this.validStarts = [];
    this.validEnds = [];
    this.currentPlayerIndex = 0;
    this.deck = [];
    this.possibleColors = Util.deepCopy(Constants.PLAYER_COLORS);
    this.turn = 0;

    // init board
    for (var i = 0; i < Constants.ROWS; i++) {
        this.board[i] = [];
        for (var j = 0; j < Constants.COLS; j++) {
            this.board[i][j] = null;
        }
    }

    // init node graph
    for (var i = 0; i <= Constants.ROWS * 3; i++) {
        this.nodes[i] = [];
        for (var j = 0; j <= Constants.COLS * 3; j++) {
            this.nodes[i][j] = {
                x: i,
                y: j,
                edges: []
            };
        }
    }

    // init deck
    for (var i = 0; i < window.CARDS.length; i++) {
        this.deck.push(this._getCard(i));
    }
    this.deck = _.shuffle(this.deck);


    // cache board edge nodes
    for (var i = 0; i < Constants.COLS; i++) {
        this.validStarts.push([i * 3 + 1, 0]);
        this.validStarts.push([i * 3 + 2, 0]);
        this.validStarts.push([i * 3 + 1, Constants.ROWS * 3]);
        this.validStarts.push([i * 3 + 2, Constants.ROWS * 3]);
    }

    for (var i = 0; i < Constants.ROWS; i++) {
        this.validStarts.push([0, i * 3 + 1]);
        this.validStarts.push([0, i * 3 + 2]);
        this.validStarts.push([Constants.COLS * 3, i * 3 + 1]);
        this.validStarts.push([Constants.COLS * 3, i * 3 + 2]);
    }

    this.validEnds = Util.deepCopy(this.validStarts);
};

/**
 * Add a player to the game
 *
 * @param playerId
 * @returns {Player} Player information
 */
Game.prototype.joinGame = function (playerId, extraData, nonRandomStart=false) {
    if (this.playerLookup[playerId]) {
        return this.playerLookup[playerId];
    } else {
        var position;
        var playerName = extraData.name || "Unknown";

        if (nonRandomStart === true) {
            position = this.nodes[this.validStarts[0][0]][this.validStarts[0][1]];
        } else {
            var randomStart = this.validStarts.splice(Math.floor(Math.random() * this.validStarts.length), 1)[0];
            position = this.nodes[randomStart[0]][randomStart[1]];
        }

        var player = {
            id: playerId,
            name: playerName,
            color: this.possibleColors.shift(),
            position: position,
            prevPosition: position,
            cards: this._drawCards(3),
            path: [position],
            status: this.players.length == 0 ? 'active' : 'inactive'
        };

        this.playerLookup[playerId] = player;
        this.players.push(player);

        this._updatePlayers();

        return player;
    }
};

/**
 * Play a card
 *
 * @param {string} playerId
 * @param {string} cardId
 */
Game.prototype.playCard = function (playerId, cardId, rotations) {
    this.turn++;

    // TODO throw InvalidMoveError if move would kill player
    var player = this.getCurrentPlayer();

    if (playerId != player.id) {
        Logger.log('Its not your turn, ' + playerId + ' Its ' + player.id + ' turn');
        throw new InvalidMoveError('Not player\'s turn');
    }

    if (_.find(player.cards, function(card) { return card.id == cardId; }) === undefined) {
        Logger.log('Player ' + playerId + ' does not have that card. Bad player!');
        throw new InvalidMoveError('Player does not have that card');
    }

    var x = Math.abs(Math.floor((player.position.x ) / 3));
    var y = Math.abs(Math.floor((player.position.y) / 3));

    if (x >= Constants.COLS) {
        x--;
    }

    if (y >= Constants.ROWS) {
        y--;
    }

    var card = this._getCard(cardId);
    var lines = card.lines;

    // rotate the lines
    for (var i = 0; i < (rotations % 4); i++) {
        lines = this._rotateLines(lines);
    }

    if (player.position.x % 3 == 0) {
        if (this.board[x][y] && (x - 1) >= 0) {
            x--;
        }
    } else {
        if (this.board[x][y] && (y - 1) >= 0) {
            y--;
        }
    }

    if (x < 0 || x >= Constants.COLS || y < 0 || y >= Constants.COLS) {
        return;
    }

    Logger.log('add card at ' + x + ', ' + y);
    this.board[x][y] = card;
    card.rotations = rotations;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var offsetX = x * 3;
        var offsetY = y * 3;

        var pointFrom = this.nodes[line.from[0] + offsetX][line.from[1] + offsetY];
        var pointTo = this.nodes[line.to[0] + offsetX][line.to[1] + offsetY];

        pointFrom.edges.push(pointTo);
        pointTo.edges.push(pointFrom);
    }

    this._updatePlayers();

    // remove the played card
    var index = _.findIndex(player.cards, function (card) {
        return card.id == cardId;
    });
    player.cards.splice(index, 1);

    // draw new card
    var newCard = this._drawCard();
    if (newCard) {
        player.cards.push(newCard);
    }
};

/**
 * Rotate 90 degrees to the left
 *
 * @param lines
 * @returns {*}
 * @private
 */
Game.prototype._rotateLines = function (lines) {
    var newLines = Util.deepCopy(lines);

    var shiftPoint = function (point, amount) {
        point[0] += amount;
        point[1] += amount;
    };

    var flip = function (point) {
        var temp = point[1];
        point[1] = point[0];
        point[0] = temp;
    };

    var negate = function (point) {
        point[1] *= -1;
    };

    for (var i = 0; i < newLines.length; i++) {
        var line = newLines[i];

        shiftPoint(line.from, -1.5);
        negate(line.from);
        flip(line.from);
        shiftPoint(line.from, 1.5);

        shiftPoint(line.to, -1.5);
        negate(line.to);
        flip(line.to);
        shiftPoint(line.to, 1.5);
    }

    return newLines;
};

Game.prototype.getCurrentPlayer = function () {
    return this.players[this.currentPlayerIndex];
};

Game.prototype.isGameOver = function () {
    return this.players.length <= 1 && this.turn > 0;
};

Game.prototype.getWinners = function () {
    return this.isGameOver() ? this.players : [];
};

/**
 * Get a card by its Id
 *
 * @param {string} id
 * @returns Card
 */
Game.prototype._getCard = function (id) {
    var lines = window.CARDS[id];
    return {
        lines: lines,
        id: id
    }
};

/**
 * Update the players based on latest board state
 * @private
 */
Game.prototype._updatePlayers = function () {
    var playersWhoMoved = [];
    _.each(this.players, function (player) {
        Logger.log('player is at ' + player.position.x + ',' + player.position.y)

        player.moves = [player.position];

        var possibleMoves = _.difference(player.position.edges, [player.position, player.prevPosition]);

        if (possibleMoves.length > 0) {
            playersWhoMoved.push(player);
        }

        while (possibleMoves.length > 0) {
            Logger.log('player moves to ' + possibleMoves[0].x + ', ' + possibleMoves[0].y);
            player.prevPosition = player.position;
            player.position = possibleMoves[0];
            player.moves.push(player.position);
            player.path.push(player.position);
            possibleMoves = _.difference(player.position.edges, [player.position, player.prevPosition]);

            if (this._isEdgeNode(player.position)) {
                Logger.log('Player ' + player.id + ' lost!!');
                player.status = 'dead';
                this.players.splice(this.players.indexOf(player), 1);
                this.currentPlayerIndex = this.currentPlayerIndex % this.players.length;
            } else {
                player.status = 'inactive';
            }
        }
    }, this);

    if (this.isGameOver()) {
        _.each(playersWhoMoved, function(player) {
            Logger.log('Player ' + player.name + ' wins');
            player.status = 'winner';
        }, this)
    } else {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.getCurrentPlayer().status = 'active';
    }
};

/**
 * Test if node is at the edge of the board
 *
 * @private
 * @param {Node} node
 * @returns {boolean}
 */
Game.prototype._isEdgeNode = function (node) {
    for (var i = 0; i < this.validEnds.length; i++) {
        if (this.validEnds[i][0] == node.x && this.validEnds[i][1] == node.y) {
            return true;
        }
    }

    return false;
};

/**
 * Get a random card or null of deck is empty
 *
 * @private
 * @returns {Card}
 */
Game.prototype._drawCard = function () {
    if (this.deck.length < 1) {
        return null;
    }

    return this.deck.pop();
};

/**
 * Draw a number of cards from the deck
 *
 * @param {int} count
 * @returns {Card[]}
 * @private
 */
Game.prototype._drawCards = function (count) {
    var cards = [];
    for (var i = 0; i < count; i++) {
        var card = this._drawCard();
        if (card) {
            cards.push(card);
        }
    }

    return cards;
};

Game.prototype._getSimplifiedPlayers = function() {
    return _.each(this.players, function(player) {
        return {
            name: player.name,
            status: player.status,
            color: player.color,
            id: player.id
        };
    });
}
