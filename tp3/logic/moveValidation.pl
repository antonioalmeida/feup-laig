
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Move validation is ordered by priority %
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% first move, white king needs to be played
validateMove( Game, Player, Piece, X, Y ):-
	getTurnIndex( Game, N ),
	N == 0,
	!,
	getBoard( Game, Board ),
	isEmpty( Board, X, Y ),
	isKing( Piece, Player ).

% final move, black king needs to be played
validateMove( Game, Player, Piece, X, Y ):-
	getTurnIndex( Game, N ),
	N == 15	,
	!,
	\+piecePlayed( Game, Player, Piece ),
	getBoard( Game, Board ),

	isEmpty( Board, X, Y),
	isKing( Piece, Player ).

% move where player is forced to use queen
validateMove( Game, Player, Piece, X, Y ):-
	needsToPlayQueen( Game, Player ),
	!,
	isQueen( Piece, Player ),
	getBoard( Game, Board ),
	isEmpty( Board, X, Y ), 

	otherPlayer( Player, Other ),
	getAttackedBoard( Game, Other, AttackedBoard ),
	getPieceAt( AttackedBoard, X, Y, Value ),
	Value \== 0.

% move where first player uses queen
validateMove( Game, Player, Piece, X, Y ):-
	\+piecePlayed( Game, Player, Piece ),
	isQueen( Piece, Player ),
	getBoard( Game, Board ),
	isEmpty( Board, X, Y ), 

	otherPlayer( Player, Other ),
	getAttackedBoard( Game, Other, AttackedBoard ),
	getPieceAt( AttackedBoard, X, Y, Value ),
	Value \== 0.

% regular move
validateMove( Game, Player, Piece, X, Y ):-
	\+isQueen( Piece, Player ),
	\+isKing( Piece, Player ),
	\+piecePlayedTwice( Game, Player, Piece ),

	getBoard( Game, Board ),
	isEmpty( Board, X, Y ), 

	otherPlayer( Player, Other ),
	getAttackedBoard( Game, Other, AttackedBoard ),
	getPieceAt( AttackedBoard, X, Y, Value ),
	Value \== 0.

% special case (other player's pieces aren't attacking any cell)
validateMove( Game, Player, Piece, X, Y ):-
	\+isKing( Piece, Player ),
	\+piecePlayedTwice( Game, Player, Piece ),

	getBoard( Game, Board ),
	isEmpty( Board, X, Y ), 

	otherPlayer( Player, Other ),
	getAttackedBoard( Game, Other, AttackedBoard ), !,
	noFreeCells( Board , AttackedBoard ). %check that no free cells are attacked at the moment

noFreeCells( Board, AttackedBoard ):-
	noFreeCellsLine( Board, AttackedBoard).

% checks for each cell in a line, seeing if it is either occupied and attacked OR not attacked
noFreeCellsLine( [ CurrLine | RemainingLines ], [ CurrAttackedLine | RemainingAttackedLines ]):-
	noFreeCellsPiece( CurrLine, CurrAttackedLine ),
	noFreeCellsLine( RemainingLines, RemainingAttackedLines ).

noFreeCellsLine( [], [] ).

% checks for a specific cell, in this case it isn't playable because it isn't being attacked
noFreeCellsPiece( [ Cell | RemainingCells ], [ AttackedCell | RemainingAttackedCells ]):-
	AttackedCell == 0,
	noFreeCellsPiece( RemainingCells, RemainingAttackedCells ).

% checks for a specific cell, in this case it isn't playable because although it is attacked, it has already been occupied
noFreeCellsPiece( [ Cell | RemainingCells ], [ AttackedCell | RemainingAttackedCells ]):-
	AttackedCell \== 0,
	Cell \== 0,
	noFreeCellsPiece(RemainingCells, RemainingAttackedCells ).

noFreeCellsPiece( [], [] ).
