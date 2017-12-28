:- use_module(library(random)).

% valid Player-Piece pairs
playerPiece('white', 'K').
playerPiece('white', 'Q').
playerPiece('white', 'R').
playerPiece('white', 'N').
playerPiece('white', 'B').

playerPiece('black', 'k').
playerPiece('black', 'q').
playerPiece('black', 'r').
playerPiece('black', 'n').
playerPiece('black', 'b').

getValidMove( Game, Player, Piece, X, Y ):-
	playerPiece(Player, Piece), 
	validateMove( Game, Player, Piece, X, Y).

getAllMoves( Game, Player, MovesList ):-
 	findall(Piece-X-Y, 
 		getValidMove( Game, Player, Piece, X, Y ), UnsortedMoves ),
 	sort( UnsortedMoves, MovesList ).

 % Easy AI
 getAIMove( Game, Player, Piece, X, Y ):-
 	getDifficulty(Game, 'easy'),
 	easyGetMove( Game, Player, Piece, X, Y ).

 % Medium AI
 getAIMove( Game, Player, Piece, X, Y ):-
 	getDifficulty(Game, 'medium'),
 	getBestMove( Game, Player, Piece, X, Y ).

 % AI vs AI first turn
 getAIMove( Game, Player, Piece, X, Y ):-
 	getGameType(Game, 'noPlayer'),
 	getTurnIndex( Game, 0 ),
 	easyGetMove( Game, Player, Piece, X, Y ).

  % AI vs AI regular turn
 getAIMove( Game, Player, Piece, X, Y ):-
 	getGameType(Game, 'noPlayer'),
 	getBestMove( Game, Player, Piece, X, Y ).

easyGetMove( Game, Player, Piece, X, Y ):-
	getAllMoves( Game, Player, MovesList ),
	random_member( Piece-X-Y, MovesList ).

getBestMove( Game, Player, Piece, X, Y ):-
	evaluateAllMoves( Game, Player, MovesList ),
	last( MovesList, _-Piece-X-Y ).

getBestMoveWithScore( Game, Player, Score, Piece, X, Y):-
	evaluateAllMoves( Game, Player, MovesList ),
	last( MovesList, Score-Piece-X-Y ).

evaluateAllMoves( Game, Player, MovesWithScore ):-
	getAllMoves( Game, Player, MovesList ), !,
	getBoard( Game, Board ), !,
	evaluateAllMovesAux( MovesList, Board, Player, [], UnsortedMoves ), !,
	sort( UnsortedMoves, MovesWithScore ).

evaluateAllMovesAux( [], _, _, ScoresList, ScoresList).

evaluateAllMovesAux( [ Piece-X-Y | RestOfMoves ], Board, Player, TempScores, ScoresList ):-
	evaluateMove( Player, Piece, X, Y, Board, Score ),
	evaluateAllMovesAux( RestOfMoves, Board, Player, [ Score-Piece-X-Y | TempScores ], ScoresList).	

evaluateMove(Player, Piece, X, Y, Board, Score):-
	makeMove( Board, Piece, X, Y, NewBoard ),
	updateAttackedBoard( NewBoard, Player, AttackedBoard ),
	!,
	evaluateBoard( AttackedBoard, Score ).

