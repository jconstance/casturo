View = function () {

};

View.prototype.drawGame = function (game) {
    $("#board").empty();

    this.drawBoard(game.board);
    this.drawPlayers(_.values(game.playerLookup));

    if (game.isGameOver() && game.getWinners().length > 0) {
        document.querySelector('#winnerBox').style.display = 'block';
        document.querySelector('#winnerBox #winnerName').innerHTML = _.pluck(game.getWinners(), 'color').join(', ');
    }

};

View.prototype.drawBoard = function (board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var card = board[i][j];
            var cardSvg = drawCard(card ? card.id : null, card ? card.rotations : null, card ? card.color : 'white');

            var originPos = translateNodePosToBoardPos([i * 3, j * 3]);

            cardSvg.setAttribute('x', originPos[0]);
            cardSvg.setAttribute('y', originPos[1]);

            cardSvg.setAttribute('id', 'card-' + i + '-' + j);

            var boardEl = document.getElementById('board');
            boardEl.appendChild(cardSvg);
        }
    }
};

View.prototype.drawPlayers = function (players) {
    _.each(players, function (player) {
        var playerPos = translateNodePosToBoardPos([player.position.x, player.position.y]);

        var playerIcon = createCircle(playerPos[0], playerPos[1], 10, player.color, '1px', 'black');

        playerIcon.setAttribute('id', 'player-id-' + player.id.substring(1));
        playerIcon.setAttribute('class', 'player-icon');

        document.getElementById('board').appendChild(playerIcon);
    })
};

