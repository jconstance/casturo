CasturoListener = function (gameManager) {
    this.gameManager = gameManager;

    this.game = new Game();
    this.view = new View();
    this.view.drawGame(this.game);
};


CasturoListener.prototype.onPlayerAvailable = function (event) {
    Logger.log('Player ' + event.playerInfo.playerId + ' is available');

    var player = this.game.joinGame(event.playerInfo.playerId, event.requestExtraMessageData || {});

    event.resultExtraMessageData = {
        activePlayerId: this.game.getCurrentPlayer().id,
        player: {
            id: player.id,
            cards: player.cards,
            color: player.color,
            posX: player.position.x,
            posY: player.position.y
        }
    };

    this.broadcast({
        activePlayerId: this.game.getCurrentPlayer().id
    });

    this.view.drawGame(this.game);
};

CasturoListener.prototype.broadcast = function (msg) {
    Logger.log(JSON.stringify(msg));
    this.gameManager.sendGameMessageToAllConnectedPlayers(msg)
};

CasturoListener.prototype.onPlayerReady = function (event) {
    Logger.log('Player ' + event.playerInfo.playerId + ' is ready');
};

CasturoListener.prototype.onPlayerIdle = function () {
    Logger.log('player idle')
};

CasturoListener.prototype.onPlayerPlaying = function () {
    Logger.log('player playing')
};

CasturoListener.prototype.onPlayerDropped = function () {
    Logger.log('player dropped')
};

CasturoListener.prototype.onPlayerQuit = function () {
    Logger.log('player quit')
};

CasturoListener.prototype.onPlayerDataChanged = function () {
    Logger.log('player data changed')
};

CasturoListener.prototype.onGameStatusTextChanged = function () {
    Logger.log('game status text changed')
};

CasturoListener.prototype.onGameMessageReceived = function (event) {
    Logger.log('Message (from ' + event.playerInfo.playerId + '): ' + JSON.stringify(event.requestExtraMessageData));

    try {
        var player = this.game.getCurrentPlayer();

        var rotations = event.requestExtraMessageData.rotations;
        this.game.playCard(event.playerInfo.playerId, event.requestExtraMessageData.cardId, rotations);

        event.resultExtraMessageData = {
            success: true,
            cards: player.cards
        };
    } catch (e) {
        console.log('here');
        debugger;
        event.resultExtraMessageData = {
            success: false,
            error: e.msg
        };
    }

    this.view.drawGame(this.game);

    if (!this.game.isGameOver()) {
        this.broadcast({
            gameOver: false,
            activePlayerId: this.game.getCurrentPlayer().id
        });
    } else {
        this.broadcast({
            gameOver: true,
            winner: this.game.players.map(function (player) {
                return {
                    id: player.id,
                    color: player.color
                };
            })
        });
    }
};

CasturoListener.prototype.onGameDataChanged = function () {
    Logger.log('game data changed')
};

CasturoListener.prototype.onGameLoading = function () {
    Logger.log('game loading')
};

CasturoListener.prototype.onGameRunning = function () {
    Logger.log('game running');
};

CasturoListener.prototype.onGamePaused = function () {
    Logger.log('game paused')
};

CasturoListener.prototype.onGameShowingInfoScreen = function () {
    Logger.log('game showing info screen')
};

CasturoListener.prototype.onLobbyOpen = function () {
    Logger.log('lobby open')
};

CasturoListener.prototype.onLobbyClosed = function () {
    Logger.log('lobby closed')
};
