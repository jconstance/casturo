var session = null;
var gameManager = null;
var availableCards = [];
var selectedCard = null;
var player = null;

/**
 * Call initialization for Cast
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, 1000);
}
/**
 * initialization
 */
function initializeCastApi() {
    var sessionRequest = new chrome.cast.SessionRequest(window.APPLICATION_ID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};
/**
 * initialization success callback
 */
function onInitSuccess() {
    appendMessage("onInitSuccess");
    chrome.cast.requestSession(sessionListener, onError);
}
/**
 * initialization error callback
 */
function onError(message) {
    appendMessage("onError: " + JSON.stringify(message));
}
/**
 * generic success callback
 */
function onSuccess(message) {
    appendMessage("onSuccess: " + message);
}
/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
    appendMessage('onStopAppSuccess');
}
/**
 * session listener during initialization
 */
function sessionListener(e) {
    appendMessage('New session ID:' + e.sessionId);
    session = e;
    session.addUpdateListener(sessionUpdateListener);
    session.addMessageListener(window.APPLICATION_NAMESPACE, receiverMessage);
    chrome.cast.games.GameManagerClient.getInstanceFor(session, function (result) {
        console.log('### Game manager client initialized!');
        gameManager = result.gameManagerClient;

        gameManager.addEventListener(chrome.cast.games.GameManagerEventType.GAME_MESSAGE_RECEIVED, function (event) {
            console.log(event);
            togglePlay(isMyTurn(event.gameMessage.activePlayerId));
        });

        console.log('### Sending AVAILABLE message.');
        gameManager.sendPlayerAvailableRequest(null, playerAvailableListener, null);


    }, onError);
}
/**
 * listener for session updates
 */
function sessionUpdateListener(isAlive) {
    var message = isAlive ? 'Session Updated' : 'Session Removed';
    message += ': ' + session.sessionId;
    appendMessage(message);
    if (!isAlive) {
        session = null;
    }
};
/**
 * utility function to log messages from the receiver
 * @param {string} namespace The namespace of the message
 * @param {string} message A message string
 */
function receiverMessage(namespace, message) {
    appendMessage("receiverMessage: " + namespace + ", " + message);
};
/**
 * receiver listener during initialization
 */
function receiverListener(e) {
    if (e === 'available') {
        appendMessage("receiver found");
    }
    else {
        appendMessage("receiver list empty");
    }
}
/**
 * stop app/session
 */
function stopApp() {
    session.stop(onStopAppSuccess, onError);
}
/**
 * send a message to the receiver using the custom namespace
 * receiver CastMessageBus message handler will be invoked
 * @param {string} message A message string
 */
function sendMessage(message) {
    gameManager.sendGameMessage({msg: message})
}
/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message) {
    console.log(message);
};

window.onload = function () {
    document.getElementById('move-right').onclick = function (e) {
        availableCards.push(availableCards.shift());
        loadActiveCard(availableCards[0], 0);
    };
    document.getElementById('move-left').onclick = function (e) {
        availableCards.unshift(availableCards.pop());
        loadActiveCard(availableCards[0], 0);
    };
    document.getElementById('play').onclick = function (e) {
        var rotations = parseInt(document.getElementById('activeCard').getAttribute('data-card-rotations'));
        gameManager.sendGameRequest({cardId: selectedCard, rotations: rotations}, function (result) {
            if (result.extraMessageData.success) {
                var cards = result.extraMessageData.cards;
                console.log(cards);
                availableCards = _.pluck(cards, 'id');
                loadActiveCard(availableCards[0], 0);
            } else {
                console.log(result.extraMessageData.msg);
            }
        })
    };

    document.getElementById('rotate-left').onclick = function (e) {
        var rotations = parseInt(document.getElementById('activeCard').getAttribute('data-card-rotations')) + 3;

        loadActiveCard(selectedCard, rotations);
    };
    document.getElementById('rotate-right').onclick = function (e) {
        var rotations = parseInt(document.getElementById('activeCard').getAttribute('data-card-rotations')) + 1;

        loadActiveCard(selectedCard, rotations);
    };
}

loadActiveCard = function (cardId, rotations) {
    var cardSvg = drawCard(cardId, rotations);
    var cardContainer = document.getElementById('activeCard');

    cardSvg.setAttributeNS(null, 'viewBox', '0, 0, 120, 120');

    var newContainer = cardContainer.cloneNode(false);
    newContainer.appendChild(cardSvg);
    newContainer.setAttribute('data-card-id', cardId);
    newContainer.setAttribute('data-card-rotations', rotations);
    selectedCard = cardId;
    cardContainer.parentNode.replaceChild(newContainer, cardContainer);
}

// This should probably be refactored into a different file.
playerAvailableListener = function (result) {
    var msg = result.extraMessageData;

    player = msg.player;
    notifyPlayerColor(player.color);

    // If its a gameover, we don't need to do anything else
    if (msg.gameOver) {
        console.log('game over');
        console.log(msg.winners);
        alert("You lose, "+player.color+"!");
    } else {
        availableCards = player.cards.map(function (card) {
            return card.id;
        });

        loadActiveCard(availableCards[0], 0);

        togglePlay(isMyTurn(msg.activePlayerId));
    }
}

notifyPlayerColor = function(color) {
    document.body.style.backgroundColor = color;
}

isMyTurn = function(activePlayerId) {
    // Is it the player's turn?
    var isMyTurn;
    try {
        isMyTurn = gameManager.getLastUsedPlayerId() == activePlayerId;
    } catch (err) {
        isMyTurn = false;
    }
    return isMyTurn;
}

togglePlay = function(canPlay) {
    if (canPlay) {
        notifyPlayerColor('white');
        setTimeout(function() {
            notifyPlayerColor(player.color);
            document.getElementById('play').disabled = false;
        }, 200);
    } else {
        document.getElementById('play').disabled = true;
    }
}
