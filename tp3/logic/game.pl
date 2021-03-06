:-include('board.pl').
:-include('moveValidation.pl').
:-include('attackedBoard.pl').
:-include('ai.pl').
:-include('utils.pl').
:-include('emojis.pl').

:-dynamic connected/2.

% case where game is finished
playGame( Game, Piece, X, Y, Game ):-
	gameOver( Game ),
	getBoard( Game, Board ),
	displayBoard( Board ),

	retractall(connected(_,_)),
	!.

% regular case
playGame( Game, Piece, X, Y, NewGame ):-
	% get stuff from game class
	getBoard( Game, Board ),
	getCurrentPlayer( Game, Player ),

	% read and validate move
	validateMove( Game, Player, Piece, X, Y ),

	% make and update moves
	makeMove( Board, Piece, X, Y, NextBoard ),
	updateMadeMoves( Game, Player, Piece, X, Y, GameTemp ),

	% prepare for next turn
	setBoard( GameTemp, NextBoard, GameTemp2 ),
	updateAttackedBoard( GameTemp2, GameTemp3 ),
	incTurnIndex( GameTemp3, GameTemp4 ),
	switchPlayer( GameTemp4, GameTemp5 ),
	checkGameOver( GameTemp5, NewGame ).

playGameAI(Game, NewGame):-
	% get stuff from game class
	getBoard( Game, Board ),
	getCurrentPlayer( Game, Player ),

	% read and validate move
	getNextMove( Game, Player, Piece, X, Y ),
	validateMove( Game, Player, Piece, X, Y ),

	% make and update moves
	makeMove( Board, Piece, X, Y, NextBoard ),
	updateMadeMoves( Game, Player, Piece, X, Y, GameTemp ),

	% prepare for next turn
	setBoard( GameTemp, NextBoard, GameTemp2 ),
	updateAttackedBoard( GameTemp2, GameTemp3 ),
	incTurnIndex( GameTemp3, GameTemp4 ),
	switchPlayer( GameTemp4, GameTemp5 ),
	checkGameOver( GameTemp5, NewGame ).

% Single Player AI's turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'singlePlayer' ),
	getAIPlayer( Game, AIPlayer ),
	AIPlayer == Player,
	write('AI is thinking...'), nl,
	getAIMove( Game, Player, Piece, X, Y ).

% AI vs AI regular turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'noPlayer' ),
	write('AI is thinking...'), nl,
	getAIMove( Game, Player, Piece, X, Y ).

%%%%%%%%%%%%%%%%
% Game "class" %
%%%%%%%%%%%%%%%%

initMultiplayerGame( Game ):-
	initialBoard( Board ),
	initialBoard( AttackedBoardWhite ),
	initialBoard( AttackedBoardBlack ),

	% Game Object %
	% 0 - game board %
	% 1 - current player %
	% 2 - turn counter %
	% 3 - board with 'white' player's attacked positions %
	% 4 - board with 'black' player's attacked positions %
	% 5 - if singleplayer, color which AI is playing for %
	% 6 - list with the pieces played %
	% 7 - boolean, true if 'white' player needs to play queen %
	% 8 - boolean, true if 'black' player needs to play queen %
	% 9 - boolean, true if game is over %
	% 10 - atom, sets game type - 'singlePlayer' or 'multiPlayer' %
	% 11 - atom, difficulty - easy, medium or hard - only in single player mode
	Game = [ Board, 'white', 0, AttackedBoardWhite, AttackedBoardBlack, AIPlayer, [], false, false, false, 'multiPlayer', Difficulty ].

initSinglePlayerGame( Game, Player, Difficulty ):-
	otherPlayer(Player, AIPlayer),
	initialBoard( Board ),
	initialBoard( AttackedBoardWhite ),
	initialBoard( AttackedBoardBlack ),
	Game = [ Board, 'white', 0, AttackedBoardWhite, AttackedBoardBlack, AIPlayer, [], false, false, false, 'singlePlayer', Difficulty ].

initNoPlayerGame( Game ):-
	initialBoard( Board ),
	initialBoard( AttackedBoardWhite ),
	initialBoard( AttackedBoardBlack ),

	Game = [ Board, 'white', 0, AttackedBoardWhite, AttackedBoardBlack, AIPlayer, [], false, false, false, 'noPlayer', Difficulty ].

getBoard( Game, Board ):-
	elementAt(0, Game, Board).

getAttackedBoard( Game, 'white', AttackedBoard):-
	elementAt(3, Game, AttackedBoard).

getAttackedBoard( Game, 'black', AttackedBoard):-
	elementAt(4, Game, AttackedBoard).

setBoard( Game, Board, NewGame ):-
	replace( Game, 0, Board, NewGame).

setAttackedBoard( Game, 'white', AttackedBoard, NewGame ):-
	replace( Game, 3, AttackedBoard, NewGame).

setAttackedBoard( Game, 'black', AttackedBoard, NewGame ):-
	replace( Game, 4, AttackedBoard, NewGame).

getCurrentPlayer( Game, Player ):-
	elementAt(1, Game, Player).

getTurnIndex( Game, N ):-
	elementAt(2, Game, N).

incTurnIndex( Game, NewGame ):-
	getTurnIndex( Game, N ),
	N1 is N+1,
	replace( Game, 2, N1, NewGame ).

decTurnIndex( Game, NewGame ):-
	getTurnIndex( Game, N ),
	N1 is N-1,
	replace( Game, 2, N1, NewGame).

getPlayedPieces( Game, PlayedPieces ):-
	elementAt( 6, Game, PlayedPieces ).

addPlayedPiece( Game, Player, Piece, X, Y, NewGame ):-
	getPlayedPieces( Game, PlayedPieces ),
	append( [Player-Piece-X-Y], PlayedPieces, NewPlayedPieces ),
	replace( Game, 6, NewPlayedPieces, NewGame ).

getLastPlayedPiece(Game, Player, Piece, X, Y):-
	% last piece played is at the head of list %
	getPlayedPieces(Game, [Player-Piece-X-Y|_]).

removeLastPlayedPiece(Game, NewGame):-
	getPlayedPieces(Game, [_|PlayedPieces]),
	replace(Game, 6, PlayedPieces, NewGame).

piecePlayed( Game, Player, Piece ):-
	getPlayedPieces( Game, PlayedPieces ),
	member( Player-Piece-_-_, PlayedPieces ).

piecePlayedTwice( Game, Player, Piece ):-
	getPlayedPieces( Game, PlayedPieces ),
	member(Player-Piece-X1-Y1, PlayedPieces),
	member(Player-Piece-X2-Y2, PlayedPieces),
	(X1 \= X2 ; Y1 \= Y2).

setNeedsToPlayQueen( Game, 'white', Value, NewGame ):-
	replace( Game, 7, Value, NewGame ).

setNeedsToPlayQueen( Game, 'black', Value, NewGame ):-
	replace( Game, 8, Value, NewGame ).

needsToPlayQueen( Game, 'white' ):-
	elementAt( 7, Game, Value ),
	Value == true.

needsToPlayQueen( Game, 'black' ):-
	elementAt( 8, Game, Value ),
	Value == true.

getGameType( Game, Type ):-
	elementAt( 10, Game, Type ).

getAIPlayer( Game, AIPlayer ):-
	elementAt(5, Game, AIPlayer ).

getUserPlayer(Game, Player):-
	getAIPlayer(Game, AIPlayer),
	otherPlayer(AIPlayer, Player).

getDifficulty( Game, Difficulty ):-
	elementAt(11, Game, Difficulty).

checkGameOver( Game, NewGame ):-
	getTurnIndex(Game, 16),
	setGameOver(Game, true, NewGame).
checkGameOver(Game,Game).

setGameOver( Game, Value, NewGame ):-
	replace( Game, 9, Value, NewGame ).

gameOver( Game ):-
	elementAt(9, Game, true).

% case where player had to play queen and does so
updateMadeMoves( Game, Player, Piece, X, Y, NewGame ):-
	isQueen( Piece, Player ),
	needsToPlayQueen( Game, Player ),
	setNeedsToPlayQueen( Game, Player, false, TempGame ),
	otherPlayer( Player, Other ),
	setNeedsToPlayQueen( TempGame, Other , false, TempGame2 ),
	addPlayedPiece( TempGame2, Player, Piece, X, Y, NewGame ).

% case where a player plays queen for the first time
updateMadeMoves( Game, Player, Piece, X, Y, NewGame ):-
	isQueen( Piece, Player ),
	otherPlayer( Player, Other ),
	\+needsToPlayQueen( Game, Other ),
	setNeedsToPlayQueen( Game, Other, true, TempGame ),
	addPlayedPiece( TempGame, Player, Piece, X, Y, NewGame ).

% regular case
updateMadeMoves( Game, Player, Piece, X, Y, NewGame ):-
	addPlayedPiece( Game, Player, Piece, X, Y, NewGame ).

%%%%%%%%%%%%%%%
%% undo move %%
%%%%%%%%%%%%%%%

% case when it is first turn
undoMoveAux(Game, Game):-
	getTurnIndex(Game, 0).

% if user is playing, need to undo twice
undoMove(Game, NewGame):-
	getGameType(Game, 'singlePlayer'),
	getCurrentPlayer(Game, CurrentPlayer),
	getUserPlayer(Game, Player),
	Player == CurrentPlayer,
	undoMoveAux(Game, Temp),
	undoMoveAux(Temp, NewGame).

undoMove(Game, NewGame):-
	getGameType(Game, 'multiPlayer'),
	undoMoveAux(Game, NewGame).

% case where current player needs to play queen
undoMoveAux(Game, NewGame):-
	getCurrentPlayer(Game, Player),
	needsToPlayQueen(Game, Player),
	setNeedsToPlayQueen(Game, Player, false, TempGame),
	getLastPlayedPiece(TempGame, Player, Piece, X, Y),
	removeLastPlayedPiece(TempGame, TempGame2),
	removeMove(TempGame2, X, Y, TempGame3),
	switchPlayer(TempGame3, TempGame4),
	decTurnIndex(TempGame4, NewGame).

% regular case undo
undoMoveAux(Game, NewGame):-
	getLastPlayedPiece(Game, Player, Piece, X, Y),
	removeLastPlayedPiece(Game, TempGame),
	removeMove(TempGame, X, Y, TempGame2),
	switchPlayer(TempGame2, TempGame3),
	decTurnIndex(TempGame3, TempGame4),
	checkLastMoveIsQueen(TempGame4, NewGame).

% remove move from board
removeMove(Game, X, Y, NewGame):-
	getBoard(Game, Board),
	makeMove(Board, 0, X, Y, NewBoard),
	setBoard(Game, NewBoard, TempGame),
	updateAttackedBoard(TempGame, NewGame).

% checking if need to readd needsToPlayQueen
checkLastMoveIsQueen(Game, NewGame):-
	getCurrentPlayer(Game, Player),
	isQueen(Queen, Player),
	\+piecePlayed(Game, Queen, Player),

	otherPlayer(Player, OtherPlayer),
	getLastPlayedPiece(Game, OtherPlayer, Piece, X, Y),
	isQueen(Piece, OtherPlayer),
	setNeedsToPlayQueen(Game, Player, true, NewGame).
% base case - do nothing
checkLastMoveIsQueen(Game, Game).

switchPlayer( Game, NewGame ):-
	getCurrentPlayer( Game, CurrentPlayer ),
	otherPlayer( CurrentPlayer, NewPlayer ),
	replace( Game, 1, NewPlayer, NewGame ).

otherPlayer('white', 'black').
otherPlayer('black', 'white').
