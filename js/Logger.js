Logger = {
    log: function (msg) {
        console.log(msg);

        var el = document.getElementById('log');

        el.value += '\n' + msg;

        el.scrollTop = el.scrollHeight;
    }

}

window.console.error = Logger.log;