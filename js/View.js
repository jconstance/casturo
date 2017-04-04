View = function () {

};

View.prototype.drawGame = function (game) {
    var board = document.getElementById('board');
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }

    var statusBoard = document.getElementById('statusBoard');
    while (statusBoard.firstChild) {
        statusBoard.removeChild(statusBoard.firstChild);
    }

    this.drawBoard(game.board);
    this.drawPlayers(_.values(game.playerLookup));
    this.drawStatus(_.values(game.playerLookup));

    if (game.isGameOver() && game.getWinners().length > 0) {
        document.querySelector('#winnerBox').style.display = 'block';
        document.querySelector('#winnerBox #winnerName').innerHTML = _.pluck(game.getWinners(), 'name').join(', ');
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
    var board = document.getElementById('board');
    _.each(players, function (player) {
        var playerPos = translateNodePosToBoardPos([player.position.x, player.position.y]);
        var playerIcon;
        if (player.moves.length > 1) {
            playerIcon = createCircle(0, 0, 10, player.color, '1px', 'black');

            var motionPath = createPlayerPath(player.moves, "2px", player.color)
            motionPath.setAttribute('id', 'player-path-' + player.id.substring(1));

            var animation = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            animation.setAttributeNS(null, 'begin', 'indefinite');
            animation.setAttributeNS(null, 'dur', (player.moves.length * 0.75)+"s");
            animation.setAttributeNS(null, 'repeatCount', '1');
            animation.setAttributeNS(null, 'fill', 'freeze');

            animation.finalX = playerPos[0];
            animation.finalY = playerPos[1];

            var finalPosition = function(e) {
                var icon = e.target.parentNode;
                icon.setAttributeNS(null, 'cx', e.target.finalX);
                icon.setAttributeNS(null, 'cy', e.target.finalY);
                icon.removeChild(e.target);
            };

            animation.addEventListener("endEvent", finalPosition, false);

            var mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#player-path-' + player.id.substring(1));

            animation.appendChild(mpath);
            playerIcon.appendChild(animation);

            board.appendChild(motionPath);
        } else {
            playerIcon = createCircle(playerPos[0], playerPos[1], 10, player.color, '1px', 'black');
        }

        playerIcon.setAttribute('id', 'player-id-' + player.id.substring(1));
        playerIcon.setAttribute('class', 'player-icon');

        board.appendChild(playerIcon);
        if (animation) {
            animation.beginElement();
        }
    })
};

View.prototype.drawStatus = function (players) {
    var statusBoard = document.getElementById('statusBoard');

    var icons = {
        'waiting': '&#8987;',
        'inactive': '&#9675;',
        'active': '&#9679;',
        'dead': '&#128128;',
        'winner': '&#127775;'
    }

    _.each(players, function (player) {
        var colorSquare = document.createElement('div');
        colorSquare.setAttribute('class', 'player-status-square');
        colorSquare.style.backgroundColor = player.color;

        var name = document.createTextNode(player.name);

        var statusIcon = document.createElement('div');
        statusIcon.setAttribute('class', 'player-status-icon');
        statusIcon.innerHTML = icons[player.status];

        var playerStatusContainer = document.createElement('div');
        playerStatusContainer.setAttribute('class', 'player-status');

        playerStatusContainer.appendChild(colorSquare);
        playerStatusContainer.appendChild(name);
        playerStatusContainer.appendChild(statusIcon);

        statusBoard.appendChild(playerStatusContainer);
    })
};

