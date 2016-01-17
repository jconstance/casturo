var gameManager;

window.onload = function () {
    cast.receiver.logger.setLevelValue(0);

    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');
    // handler for the 'ready' event
    castReceiverManager.onReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");
    };
    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function (event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };
    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function (event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
    };


    // Game Manager config
    var gameConfig = new cast.receiver.games.GameManagerConfig();
    gameConfig.applicationName = 'Casturo';
    gameConfig.maxPlayers = 8;

    gameManager = new cast.receiver.games.GameManager(gameConfig);
    var casturoListener = new CasturoListener(gameManager);
    gameManager.addGameManagerListener(casturoListener);

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');

    gameManager.updateGameplayState(cast.receiver.games.GameplayState.RUNNING);
}
