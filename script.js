document.addEventListener("DOMContentLoaded", function() {
    const boardElement = document.getElementById("chessboard");
    let selectedPiece = null;
    let selectedPiecePosition = null;
    let highlightedSquares = new Set();
    let currentPlayer = 'white'; 

    let board = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
    ];

    const pieces = {
        'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
        'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
        'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
        'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
        'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
        'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
        'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
        'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
        'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
        'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
    };

    function drawBoard() {
        boardElement.innerHTML = ''; 

        board.forEach((row, rowIndex) => {
            row.forEach((piece, colIndex) => {
                createSquare(piece, rowIndex, colIndex);
            });
        });
    }
    function getLegalMoves(row, col) {
        const piece = board[row][col]; 
        if (!piece) {
            console.error(`No piece at row=${row}, col=${col}`);
            return [];
        }
         selectedPiece = piece;
    let moves = [];
    
        if (piece.toLowerCase() === 'p') {
            highlightPawnMoves(row, col, piece);
        } else if (piece.toLowerCase() === 'n') {
            highlightKnightMoves(row, col);
        } else if (piece.toLowerCase() === 'r') {
            highlightRookMoves(row, col);
        } else if (piece.toLowerCase() === 'b') {
            highlightBishopMoves(row, col);
        } else if (piece.toLowerCase() === 'q') {
            highlightQueenMoves(row, col);
        } else if (piece.toLowerCase() === 'k') {
            highlightKingMoves(row, col);
        }
    
        highlightedSquares.forEach(square => {
            const [r, c] = square.split('-').map(Number);
            moves.push([r, c]);
        });
    
        return moves;
    }
    function redrawBoard() {
        
        clearHighlights();
    
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = cell.dataset.row;
            const col = cell.dataset.col;
            const piece = board[row][col];
            cell.textContent = piece; 
        });
    }
    
    function createSquare(piece, rowIndex, colIndex) {
        const square = document.createElement("div");
        square.classList.add("square");

        if ((rowIndex + colIndex) % 2 === 0) {
            square.classList.add("white");
        } else {
            square.classList.add("green");
        }

        if (piece !== ' ') {
            const img = document.createElement("img");
            img.src = pieces[piece];
            square.appendChild(img);
        }

        square.addEventListener('click', () => {
            if (selectedPiece) {
                if (highlightedSquares.has(`${rowIndex}-${colIndex}`)) {
                    movePiece(rowIndex, colIndex);
                } else {
                    clearHighlights();
                    selectedPiece = null;
                    selectedPiecePosition = null;
                }
            } else {
                selectPiece(piece, rowIndex, colIndex);
            }
        });

        boardElement.appendChild(square);
    }

    function selectPiece(piece, row, col) {
        clearHighlights();
        selectedPiece = piece;
        selectedPiecePosition = [row, col];
        highlightedSquares.clear();
        console.log("Piece Selected:", selectedPiece);
        console.log("Selected Piece Position:", selectedPiecePosition);
    
        if (piece !== ' ') {
            if ((currentPlayer === 'white' && piece === piece.toUpperCase()) || 
                (currentPlayer === 'black' && piece === piece.toLowerCase())) {
                if (piece.toLowerCase() === 'p') highlightPawnMoves(row, col, piece);
                else if (piece.toLowerCase() === 'n') highlightKnightMoves(row, col);
                else if (piece.toLowerCase() === 'r') highlightRookMoves(row, col);
                else if (piece.toLowerCase() === 'b') highlightBishopMoves(row, col);
                else if (piece.toLowerCase() === 'q') highlightQueenMoves(row, col);
                else if (piece.toLowerCase() === 'k') highlightKingMoves(row, col);
            }
        }
    }
    

    function movePiece(row, col) {
        if (isValidSquare(row, col) && selectedPiece) {
            if (canMoveTo(row, col)) {
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[row][col] = selectedPiece;
                tempBoard[selectedPiecePosition[0]][selectedPiecePosition[1]] = ' ';
    
                if (!isKingInCheck(tempBoard, currentPlayer)) {
                    board = tempBoard;
                    drawBoard();
                    clearHighlights();
                    selectedPiece = null;
                    selectedPiecePosition = null;
    
                    switchTurn();
    
                    if (isCheckmate()) {
                        setTimeout(() => {
                            clearHighlights();
                            alert(`${currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!`);
                            
                            redrawBoard();
                        }, 100);
                    } else if (isCheck(currentPlayer)) {
                        setTimeout(() => {
                            clearHighlights();
                            alert(`${currentPlayer} is in check!`);
                        }, 100);
                    }
                }
            }
        }
    }
    
   
    function canMoveTo(row, col) {
        if (!isValidSquare(row, col)) {
            return false;
        }
    
        if (!selectedPiecePosition || selectedPiecePosition.length < 2) {
            return false;
        }
    
        const piece = board[selectedPiecePosition[0]][selectedPiecePosition[1]];
    
        if (!piece) {
            return false;
        }
    
        const targetPiece = board[row][col];
    
        if (targetPiece === ' ') {
            return true;
        } else {
            const isWhitePiece = piece === piece.toUpperCase();
            const isTargetWhitePiece = targetPiece === targetPiece.toUpperCase();
            return isWhitePiece !== isTargetWhitePiece;
        }
    }
    
    
    function switchTurn() {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    }

    function highlightSquare(row, col) {
        const index = row * 8 + col;
        const targetSquare = boardElement.children[index];
        const highlight = document.createElement("div");
        highlight.classList.add("highlight");
        targetSquare.appendChild(highlight);
        highlightedSquares.add(`${row}-${col}`);
    }

    function clearHighlights() {
        const highlights = document.querySelectorAll('.highlight');
        highlights.forEach(highlight => highlight.remove());
        highlightedSquares.clear();
    }

    function isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function highlightPawnMoves(row, col, piece) {
        const direction = piece === 'P' ? 1 : -1;

        if (isValidSquare(row + direction, col)) {
            if (board[row + direction][col] === ' ') {
                highlightSquare(row + direction, col);

                if ((piece === 'P' && row === 1) || (piece === 'p' && row === 6)) {
                    if (isValidSquare(row + 2 * direction, col) && board[row + 2 * direction][col] === ' ') {
                        highlightSquare(row + 2 * direction, col);
                    }
                }
            }
        }

        if (isValidSquare(row + direction, col - 1) && board[row + direction][col - 1] !== ' ' &&
            (piece === piece.toUpperCase() ? board[row + direction][col - 1] === board[row + direction][col - 1].toLowerCase() : board[row + direction][col - 1] === board[row + direction][col - 1].toUpperCase())) {
            highlightSquare(row + direction, col - 1);
        }
        if (isValidSquare(row + direction, col + 1) && board[row + direction][col + 1] !== ' ' &&
            (piece === piece.toUpperCase() ? board[row + direction][col + 1] === board[row + direction][col + 1].toLowerCase() : board[row + direction][col + 1] === board[row + direction][col + 1].toUpperCase())) {
            highlightSquare(row + direction, col + 1);
        }
    }

    function highlightKnightMoves(row, col) {
        const moves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];

        moves.forEach(move => {
            const [dx, dy] = move;
            const newRow = row + dx;
            const newCol = col + dy;
            if (isValidSquare(newRow, newCol) && canMoveTo(newRow, newCol)) {
                highlightSquare(newRow, newCol);
            }
        });
    }

    function highlightRookMoves(row, col) {
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];

        directions.forEach(direction => {
            const [dx, dy] = direction;
            let newRow = row + dx;
            let newCol = col + dy;
            while (isValidSquare(newRow, newCol) && board[newRow][newCol] === ' ') {
                highlightSquare(newRow, newCol);
                newRow += dx;
                newCol += dy;
            }
            if (isValidSquare(newRow, newCol) && canMoveTo(newRow, newCol)) {
                highlightSquare(newRow, newCol);
            }
        });
    }

    function highlightBishopMoves(row, col) {
        const directions = [
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        directions.forEach(direction => {
            const [dx, dy] = direction;
            let newRow = row + dx;
            let newCol = col + dy;
            while (isValidSquare(newRow, newCol) && board[newRow][newCol] === ' ') {
                highlightSquare(newRow, newCol);
                newRow += dx;
                newCol += dy;
            }
            if (isValidSquare(newRow, newCol) && canMoveTo(newRow, newCol)) {
                highlightSquare(newRow, newCol);
            }
        });
    }

    function highlightQueenMoves(row, col) {
        highlightRookMoves(row, col);
        highlightBishopMoves(row, col);
    }

    function highlightKingMoves(row, col) {
        const moves = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        moves.forEach(move => {
            const [dx, dy] = move;
            const newRow = row + dx;
            const newCol = col + dy;
            if (isValidSquare(newRow, newCol) && canMoveTo(newRow, newCol)) {
                highlightSquare(newRow, newCol);
            }
        });
    }

    function isCheck(player) {
        const king = player === 'white' ? 'K' : 'k';
        let kingPosition = null;

        board.forEach((row, rowIndex) => {
            row.forEach((piece, colIndex) => {
                if (piece === king) {
                    kingPosition = [rowIndex, colIndex];
                }
            });
        });

        if (!kingPosition) {
            return false; 
        }

        const [kingRow, kingCol] = kingPosition;
        const opponentPieces = player === 'white' ? 'rnbqkp' : 'RNBQKP';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (opponentPieces.includes(piece)) {
                    if (canPieceAttack(piece, row, col, kingRow, kingCol)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isKingInCheck(boardState, player) {
        const king = player === 'white' ? 'K' : 'k';
        let kingPosition = null;
    
        boardState.forEach((row, rowIndex) => {
            row.forEach((piece, colIndex) => {
                if (piece === king) {
                    kingPosition = [rowIndex, colIndex];
                }
            });
        });
    
        if (!kingPosition) {
            return false; 
        }
    
        const [kingRow, kingCol] = kingPosition;
        const opponentPieces = player === 'white' ? 'rnbqkp' : 'RNBQKP';
    
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if (opponentPieces.includes(piece) && boardState[row][col]) { 
                    if (canPieceAttack(piece, row, col, kingRow, kingCol, boardState)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    

    function canPieceAttack(piece, fromRow, fromCol, toRow, toCol, boardState = board) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
    
        switch (piece.toLowerCase()) {
            case 'p':
                const direction = piece === 'p' ? 1 : -1;
                if (rowDiff === 1 && colDiff === 1 && boardState[toRow][toCol] !== ' ' &&
                    ((piece === 'p' && toRow > fromRow) || (piece === 'P' && toRow < fromRow))) {
                    return true; 
                }
                break;
    
            case 'n': 
                if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                    return true; 
                }
                break;
    
            case 'r':
                if (rowDiff === 0 || colDiff === 0) {
                    let stepRow = rowDiff === 0 ? 0 : (toRow - fromRow) / rowDiff;
                    let stepCol = colDiff === 0 ? 0 : (toCol - fromCol) / colDiff;
                    let currentRow = fromRow + stepRow;
                    let currentCol = fromCol + stepCol;
                    while (currentRow !== toRow || currentCol !== toCol) {
                        if (boardState[currentRow][currentCol] !== ' ') {
                            return false; 
                        }
                        currentRow += stepRow;
                        currentCol += stepCol;
                    }
                    return true;
                }
                break;
    
            case 'b': 
                if (rowDiff === colDiff) {
                    let stepRow = (toRow - fromRow) / rowDiff;
                    let stepCol = (toCol - fromCol) / colDiff;
                    let currentRow = fromRow + stepRow;
                    let currentCol = fromCol + stepCol;
                    while (currentRow !== toRow || currentCol !== toCol) {
                        if (boardState[currentRow][currentCol] !== ' ') {
                            return false; 
                        }
                        currentRow += stepRow;
                        currentCol += stepCol;
                    }
                    return true; 
                }
                break;
    
            case 'q': 
                if (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) {
                    let stepRow = rowDiff === 0 ? 0 : (toRow - fromRow) / rowDiff;
                    let stepCol = colDiff === 0 ? 0 : (toCol - fromCol) / colDiff;
                    let currentRow = fromRow + stepRow;
                    let currentCol = fromCol + stepCol;
                    while (currentRow !== toRow || currentCol !== toCol) {
                        if (boardState[currentRow][currentCol] !== ' ') {
                            return false; 
                        }
                        currentRow += stepRow;
                        currentCol += stepCol;
                    }
                    return true; 
                }
                break;
    
            case 'k': 
                if (rowDiff <= 1 && colDiff <= 1) {
                    return true;
                }
                break;
    
            default:
                return false;
        }
        return false;
    }
    function getKingMoves(row, col) {
        const moves = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
    
        return moves.filter(([dx, dy]) => {
          const newRow = row + dx;
          const newCol = col + dy;
          return isValidSquare(newRow, newCol) && canMoveTo(newRow, newCol);
        });
      }

      function isCheckmate() {
        const player = currentPlayer;
        const king = player === 'white' ? 'K' : 'k';
        let kingPosition = null;
    
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === king) {
                    kingPosition = [row, col];
                    break;
                }
            }
            if (kingPosition) break;
        }
    
        if (!kingPosition) {
            console.error('King not found on the board.');
            return false; 
        }
    
        const [kingRow, kingCol] = kingPosition;
    
        
        if (!isKingInCheck(board, player)) {
            return false; 
        }
    
        const kingMoves = getKingMoves(kingRow, kingCol);
        for (const [newRow, newCol] of kingMoves) {
            if (canMoveTo(newRow, newCol)) {
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[newRow][newCol] = king;
                tempBoard[kingRow][kingCol] = ' ';
                if (!isKingInCheck(tempBoard, player)) {
                    console.log(`King can move to [${newRow}, ${newCol}] and is not in check.`);
                    return false;
                }
            }
        }
            for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if ((player === 'white' && piece === piece.toUpperCase()) || (player === 'black' && piece === piece.toLowerCase())) {
                    if (piece === king) continue; 
                    const legalMoves = getLegalMoves(row, col);
                    for (const [moveRow, moveCol] of legalMoves) {
                        const tempBoard = JSON.parse(JSON.stringify(board));
                        tempBoard[moveRow][moveCol] = piece;
                        tempBoard[row][col] = ' ';
                        if (!isKingInCheck(tempBoard, player)) {
                            console.log(`Piece at [${row}, ${col}] can move to [${moveRow}, ${moveCol}] and block/checkmate.`);
                            return false; 
                        }
                    }
                }
            }
        }
    
        console.log('Checkmate detected.');
        return true;
    }
    
    
    drawBoard();
});
