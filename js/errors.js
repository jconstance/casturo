InvalidMoveError = function (msg) {
    this.msg = msg;
}
InvalidMoveError.prototype = new Error();
