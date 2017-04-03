var cardWidth=120;
var cardHeight=cardWidth;

rotateCard = function(card, rotations) {
    desiredRotations = rotations % 4;

    if (desiredRotations == 0) {
        return card;
    } else {
        matrix = createMatrixFromCard(card);

        for (var i = desiredRotations - 1; i >= 0; i--) {
            matrix = reverseColumns(transposeMatrix(matrix));
        };

        return createCardFromMatrix(matrix);
    }
}

createMatrixFromCard = function(paths) {
    matrix = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]];

    for (var i = paths.length -1; i >= 0; i--) {
        var path = paths[i];

        matrix[path.from[1]][path.from[0]] = i;
        matrix[path.to[1]][path.to[0]] = i;
    };

    return matrix;
}

createCardFromMatrix = function(matrix) {
    paths = [
        {"to": null, "from": null},
        {"to": null, "from": null},
        {"to": null, "from": null},
        {"to": null, "from": null}];

    for (var y = matrix.length - 1; y >= 0; y--) {
        for (var x = matrix[y].length - 1; x >= 0; x--) {
            var value = matrix[y][x];
            if(value != null) {
                var path = paths[value];
                if(!path.from) {
                    path.from = [x, y];
                } else {
                    path.to = [x, y];
                }
            }
        };
    };

    return paths;
}

debugMatrix = function(matrix) {
    for (var i = matrix.length - 1; i >= 0; i--) {
        console.log(JSON.stringify(matrix[i]));
    };
}

transposeMatrix = function(matrix) {
    newMatrix = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]];

    for (var y = matrix.length - 1; y >= 0; y--) {
        for (var x = matrix[y].length - 1; x >= 0; x--) {
            newMatrix[x][y] = matrix[y][x];
        };
    };

    return newMatrix;
}

reverseColumns = function(matrix) {
    for (var y = matrix.length - 1; y >= 0; y--) {
        matrix[y].reverse();
    };

    return matrix;
}

drawLineBetweenNodes = function(svgEl, pos1, pos2, centerPos) {
    var boardPos1 = translateNodePosToBoardPos(pos1);
    var boardPos2 = translateNodePosToBoardPos(pos2);
    var centerPos = translateNodePosToBoardPos(centerPos);

    svgEl.appendChild(createCurvedLine(boardPos1[0], boardPos1[1], boardPos2[0], boardPos2[1], centerPos[0], centerPos[1], 5, 'black'));
}

drawCard = function(cardId, rotations, bgColor) {
    var svg = createSvg(0, 0);

    if(!bgColor) {
        bgColor = 'white';
    }

    svg.appendChild(createRect(0, 0, cardWidth, cardHeight, bgColor, 'black', '1px'));
    svg.setAttribute('class', 'card');

    if(cardId != null) {
        // Make a copy of our card.
        var card = JSON.parse(JSON.stringify(window.CARDS[cardId]));

        // Rotate our card if needed
        if (rotations != null) {
            card = rotateCard(card, rotations);
        }

        // Draw our paths
        for (var i = card.length - 1; i >= 0; i--) {
            var path = card[i];

            var centerPos = [1.5, 1.5];

            drawLineBetweenNodes(svg, path.from, path.to, centerPos);
        };
    }

    return svg;
}

createLine = function(x1,y1,x2,y2,width,color) {
    var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    aLine.setAttributeNS(null, 'x1', x1);
    aLine.setAttributeNS(null, 'y1', y1);
    aLine.setAttributeNS(null, 'x2', x2);
    aLine.setAttributeNS(null, 'y2', y2);
    aLine.setAttributeNS(null, 'stroke-width', width);
    aLine.setAttributeNS(null, 'stroke', color);
    return aLine;
}

createCurvedLine = function(x1,y1,x2,y2,cx,cy,width,color) {
    var definition = "M "+x1+" "+y1+" Q "+cx+" "+cy+" "+x2+" "+y2;

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', definition);
    path.setAttributeNS(null, 'stroke-width', width);
    path.setAttributeNS(null, 'stroke', color);
    path.setAttributeNS(null, 'fill', 'transparent');
    return path;
}

createRect = function(x,y,width,height,bgColor,borderColor,borderWidth) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'x', x);
    rect.setAttributeNS(null, 'y', y);
    rect.setAttributeNS(null, 'width', width);
    rect.setAttributeNS(null, 'height', height);
    rect.setAttributeNS(null, 'fill', bgColor);
    rect.setAttributeNS(null, 'stroke', borderColor);
    rect.setAttributeNS(null, 'stroke-width', borderWidth);
    return rect;
}

createCircle = function(x,y,r,bgColor,borderColor,borderWidth) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', r);
    circle.setAttributeNS(null, 'fill', bgColor);
    circle.setAttributeNS(null, 'stroke', borderColor);
    circle.setAttributeNS(null, 'stroke-width', borderWidth);
    return circle;
}

createSvg = function(x,y) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'x', x);
    svg.setAttributeNS(null, 'y', y);
    return svg;
}

translateNodePosToBoardPos = function(pos) {
    return [pos[0] * (cardWidth / 3), pos[1] * (cardHeight / 3)]
}

createPlayerPath = function(moves, width, color) {
    var definition = "";
    var prevMove = moves.shift();

    _.every(moves, function(move) {
        Logger.log(move);
        var pos = translateNodePosToBoardPos([move.x, move.y]);
        var prevPos = translateNodePosToBoardPos([prevMove.x, prevMove.y]);
        var centerPosX = Math.floor((move.x + prevMove.x) / 2 / 3) * 3;
        var centerPosY = Math.floor((move.y + prevMove.y) / 2 / 3) * 3;

        var origin = _.difference(prevMove.edges, [prevMove, move]);

        if (move.x == 0) {
            centerPosX += 1.5;
        } else if (move.x == 18 && prevMove.x == 18) {
            centerPosX -= 1.5;
        } else if (move.x == prevMove.x && move.x % 3 == 0 && move.x - origin[0].x < 0) {
            centerPosX -= 1.5;
        } else {
            centerPosX += 1.5;
        }

        if (move.y == 0) {
            centerPosY += 1.5;
        } else if (move.y == 18 && prevMove.y == 18) {
            centerPosY -= 1.5;
        } else if (move.y == prevMove.y && move.y % 3 == 0 && move.y - origin[0].y < 0) {
            centerPosY -= 1.5;
        } else {
            centerPosY += 1.5;
        }

        var centerPos = translateNodePosToBoardPos(
            [
                centerPosX,
                centerPosY
            ]
        );

        definition += "M "+prevPos[0]+" "+prevPos[1]+" Q "+centerPos[0]+" "+centerPos[1]+" "+pos[0]+" "+pos[1]+" ";
        Logger.log(definition);
        prevPrevMove = prevMove;
        prevMove = move;
        return true;
    });

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', definition);
    path.setAttributeNS(null, 'stroke-width', width);
    path.setAttributeNS(null, 'stroke', color);
    path.setAttributeNS(null, 'fill', 'transparent');
    return path;
}
