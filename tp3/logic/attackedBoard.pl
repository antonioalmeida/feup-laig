% this might be a better approach
updateAttackedBoard( Board, Player, AttackedBoard ):-
    initialBoard( Temp ),
    updateAttackedBoardAux( Player, Board, Temp, X, Y, AttackedBoard ).

updateAttackedBoard( Game, NewGame ):-
    getBoard( Game, Board ),
    initialBoard( AttackedBoard ),
    X is 0, Y is 0,
    updateAttackedBoardAux( white, Board, AttackedBoard, X, Y, NewAttackedBoardWhite ),
    updateAttackedBoardAux( black, Board, AttackedBoard, X, Y, NewAttackedBoardBlack ),
    setAttackedBoard( Game, white, NewAttackedBoardWhite, TempGame ),
    setAttackedBoard( TempGame, black, NewAttackedBoardBlack, NewGame ).

% case where board locations is NOT empty
updateAttackedBoardAux( Player, Board, AttackedBoard, X, Y, NewAttackedBoard ):-
    \+(X == 8),
    \+(isEmpty( Board, X, Y )),
    getPieceAt( Board, X, Y, Piece ),
    pieceAttackedUpdate( Player, Board, AttackedBoard, Piece, X, Y, NextAttackedBoard ),
    X1 is X+1,
    updateAttackedBoardAux( Player, Board, NextAttackedBoard, X1, Y, NewAttackedBoard).

% case where board location is empty
updateAttackedBoardAux( Player, Board, AttackedBoard, X, Y, NewAttackedBoard ):-
    \+(X == 8),
    isEmpty( Board, X, Y ),
    X1 is X+1,
    updateAttackedBoardAux( Player, Board, AttackedBoard, X1, Y, NewAttackedBoard).

% case where X == 8
updateAttackedBoardAux( Player, Board, AttackedBoard, 8, Y, NewAttackedBoard ):-
    X1 is 0,
    Y1 is Y+1,
    updateAttackedBoardAux( Player, Board, AttackedBoard, X1, Y1, NewAttackedBoard).

% case where Y == 8 (final case)
updateAttackedBoardAux( Player, _, AttackedBoard, _, 8, NewAttackedBoard ):-
    NewAttackedBoard = AttackedBoard.

% King
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    isKing( Piece, Player ),
    !,
    Y1 is Y-1,
    Y2 is Y+1,
    X1 is X-1,
    X2 is X+1,
    % not really making a move, simply putting 1 on the given position %
    incValueAt( AttackedPositions, X1, Y, AttackedPositions2),
    incValueAt( AttackedPositions2, X1, Y1, AttackedPositions3),
    incValueAt( AttackedPositions3, X1, Y2, AttackedPositions4),
    incValueAt( AttackedPositions4, X2, Y, AttackedPositions5),
    incValueAt( AttackedPositions5, X2, Y1, AttackedPositions6),
    incValueAt( AttackedPositions6, X2, Y2, AttackedPositions7),
    incValueAt( AttackedPositions7, X, Y1, AttackedPositions8),
    incValueAt( AttackedPositions8, X, Y2, FinalAttackedPositions).

% Knight
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    isKnight( Piece, Player ),
    !,
    Xplus1 is X+1,
    Xminus1 is X-1,
    Xplus2 is X+2,
    Xminus2 is X-2,
    Yplus2 is Y+2,
    Yminus2 is Y-2,
    Yplus1 is Y+1,
    Yminus1 is Y-1,

    incValueAt( AttackedPositions, Xplus1, Yplus2, AttackedPositions2 ),
    incValueAt( AttackedPositions2, Xplus1, Yminus2, AttackedPositions3 ),
    incValueAt( AttackedPositions3, Xminus1, Yplus2, AttackedPositions4 ),
    incValueAt( AttackedPositions4, Xminus1, Yminus2, AttackedPositions5 ),
    incValueAt( AttackedPositions5, Xplus2, Yplus1, AttackedPositions6 ),
    incValueAt( AttackedPositions6, Xplus2, Yminus1, AttackedPositions7 ),
    incValueAt( AttackedPositions7, Xminus2, Yplus1, AttackedPositions8 ),
    incValueAt( AttackedPositions8, Xminus2, Yminus1, FinalAttackedPositions ).

% Rook
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    isRook( Piece, Player ),
    !,
    pieceAttackedPositions( Board, AttackedPositions, X, Y, 1, 0, AttackedPositions1 ),
    pieceAttackedPositions( Board, AttackedPositions1, X, Y, -1, 0, AttackedPositions2 ),
    pieceAttackedPositions( Board, AttackedPositions2, X, Y, 0, 1, AttackedPositions3 ),
    pieceAttackedPositions( Board, AttackedPositions3, X, Y, 0, -1, FinalAttackedPositions ).

% Bishop
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    isBishop( Piece, Player ),
    !,
    pieceAttackedPositions( Board, AttackedPositions, X, Y, 1, 1, AttackedPositions1 ),
    pieceAttackedPositions( Board, AttackedPositions1, X, Y, 1, -1, AttackedPositions2 ),
    pieceAttackedPositions( Board, AttackedPositions2, X, Y, -1, 1, AttackedPositions3 ),
    pieceAttackedPositions( Board, AttackedPositions3, X, Y, -1, -1, FinalAttackedPositions ).

% Queen
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    isQueen( Piece, Player ),
    !,
    pieceAttackedPositions( Board, AttackedPositions, X, Y, 1, 0, AttackedPositions1 ),
    pieceAttackedPositions( Board, AttackedPositions1, X, Y, -1, 0, AttackedPositions2 ),
    pieceAttackedPositions( Board, AttackedPositions2, X, Y, 0, 1, AttackedPositions3 ),
    pieceAttackedPositions( Board, AttackedPositions3, X, Y, 0, -1, AttackedPositions4 ),
    pieceAttackedPositions( Board, AttackedPositions4, X, Y, 1, 1, AttackedPositions5 ),
    pieceAttackedPositions( Board, AttackedPositions5, X, Y, 1, -1, AttackedPositions6 ),
    pieceAttackedPositions( Board, AttackedPositions6, X, Y, -1, 1, AttackedPositions7 ),
    pieceAttackedPositions( Board, AttackedPositions7, X, Y, -1, -1, FinalAttackedPositions ).

% Case where piece is from different player
pieceAttackedUpdate( Player, Board, AttackedPositions, Piece, X, Y, FinalAttackedPositions ):-
    FinalAttackedPositions = AttackedPositions.

% Recursive generic function %

% case where off limits in x
pieceAttackedPositions( _, AttackedPositions, 8, _, _, _, FinalAttackedPositions):-
    FinalAttackedPositions is AttackedPositions.

pieceAttackedPositions( _, AttackedPositions, -1, _, _, _, FinalAttackedPositions):-
    FinalAttackedPositions is AttackedPositions.

% case where off limits in y
pieceAttackedPositions( _, AttackedPositions, _, 8, _, _, FinalAttackedPositions):-
    FinalAttackedPositions is AttackedPositions.

pieceAttackedPositions( _, AttackedPositions, _, -1, _, _, FinalAttackedPositions):-
    FinalAttackedPositions is AttackedPositions.

% case where board location is occupied
pieceAttackedPositions( Board, AttackedPositions, X, Y, DX, DY, FinalAttackedPositions):-
    CurrX is X+DX, CurrY is Y+DY,
    \+(isEmpty( Board, CurrX, CurrY )),
    incValueAt( AttackedPositions, CurrX, CurrY, FinalAttackedPositions ).

% case where board location is empty
pieceAttackedPositions( Board, AttackedPositions, X, Y, DX, DY, FinalAttackedPositions):-
    CurrX is X+DX, CurrY is Y+DY,
    isEmpty( Board, CurrX, CurrY ),
    incValueAt( AttackedPositions, CurrX, CurrY, AttackedPositions1 ),
    pieceAttackedPositions( Board, AttackedPositions1, CurrX, CurrY, DX, DY, FinalAttackedPositions ).

incValueAt( Board, X, Y, NewBoard ):-
    isWithinLimits(X),
    isWithinLimits(Y),
    N is 0,
    incValueAtAux( Board, N, X, Y, [], NewBoard ).

% case where X or Y are off limits
incValueAt( Board, _, _, Board ).

% reverse temp board
incValueAtAux( [], _, _, _, TempBoard, NewBoard ):-
    reverse( TempBoard, NewBoard ).


% case where N == Y
incValueAtAux( [ CurrentLine | RestOfBoard ], Y, X, Y, TempBoard, NewBoard ):-
    N1 is Y+1,
    inc( CurrentLine, X, NewLine ),
    incValueAtAux( RestOfBoard, N1, X, Y, [ NewLine | TempBoard ], NewBoard ).

incValueAtAux( [ CurrentLine | RestOfBoard ], N, X, Y, TempBoard, NewBoard ):-
    N1 is N+1,
    incValueAtAux( RestOfBoard, N1, X, Y, [ CurrentLine | TempBoard ], NewBoard ).

isKing('K', white).
isKing('k', black).

isKnight('N', white).
isKnight('n', black).

isRook('R', white).
isRook('r', black).

isBishop('B', white).
isBishop('b', black).

isQueen('Q', white).
isQueen('q', black).
