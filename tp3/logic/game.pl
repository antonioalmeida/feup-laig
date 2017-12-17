:-include('board.pl').
:-include('moveValidation.pl').
:-include('attackedBoard.pl').
:-include('userInput.pl').
:-include('ai.pl').
:-include('utils.pl').
:-include('main.pl').
:-include('emojis.pl').

:-dynamic connected/2.

% case where game is finished
playGame( Game, Piece, X, Y, Game ):-
%playGame( Game):-
	gameOver( Game ),
	getBoard( Game, Board ),
	displayBoard( Board ),

	getAttackedBoard( Game, 'white', AttackedBoardWhite ),
	getAttackedBoard( Game, 'black', AttackedBoardBlack ),

	evaluateBoard( AttackedBoardWhite, WhiteScore ),
	evaluateBoard( AttackedBoardBlack, BlackScore ),

	% TODO: add final scores to final game object
	displayScore( WhiteScore, BlackScore ),
	displayWinner( WhiteScore, BlackScore ),

	retractall(connected(_,_)),
	!.

% regular case 
playGame( Game, Piece, X, Y, NewGame ):-
	% get stuff from game class
	getBoard( Game, Board ),
	displayTurnInfo( Game ),
	getCurrentPlayer( Game, Player ),
	displayBoard( Board ),

	% read and validate move
	% getNextMove( Game, Player, Piece, X, Y ),
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

	%clearScreen,
	%playGame(NewGame).

% Single Player AI's turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'singlePlayer' ),
	getAIPlayer( Game, AIPlayer ),
	AIPlayer == Player,
	write('AI is thinking...'), nl,
	getAIMove( Game, Player, Piece, X, Y ).

% Single Player user's turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'singlePlayer' ),
	readMoveFromUser( Player, Piece, X, Y ).

%  Multiplayer regular turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'multiPlayer' ),
	readMoveFromUser( Player, Piece, X, Y ).

% AI vs AI regular turn
getNextMove( Game, Player, Piece, X, Y ):-
	getGameType( Game, 'noPlayer' ),
	write('AI is thinking...'), nl,
	getAIMove( Game, Player, Piece, X, Y ),
	write('The AI has decided!'), nl,
	write('Press ENTER to apply the move.'), nl,
	read_line(_).

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

initSinglePlayerGame( Game, AIPlayer, Difficulty ):-
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

% case where game is over 
undoMove(Game, NewGame):-
	gameOver(Game),
	setGameOver(Game, false, TempGame),
	getLastPlayedPiece(TempGame, Player, Piece, X, Y),
	removeLastPlayedPiece(TempGame, TempGame2),
	removeMove(TempGame2, X, Y, NewGame).

% case where current player needs to play queen
undoMove(Game, NewGame):-
	getCurrentPlayer(Game, Player),
	needsToPlayQueen(Game, Player),
	setNeedsToPlayQueen(Game, Player, false, TempGame),
	getLastPlayedPiece(TempGame, Player, Piece, X, Y),
	removeLastPlayedPiece(TempGame, TempGame2),
	removeMove(TempGame2, X, Y, NewGame).

% regular case undo
undoMove(Game, NewGame):-
	getLastPlayedPiece(Game, Player, Piece, X, Y),
	removeLastPlayedPiece(Game, TempGame),
	removeMove(TempGame, X, Y, NewGame).

% remove move from board
removeMove(Game, X, Y, NewGame):-
	getBoard(Game, Board),
	makeMove(Board, 0, X, Y, NewBoard),
	setBoard(Game, NewBoard, TempGame),
	updateAttackedBoard(TempGame, NewGame).

switchPlayer( Game, NewGame ):-
	getCurrentPlayer( Game, CurrentPlayer ),
	otherPlayer( CurrentPlayer, NewPlayer ),
	replace( Game, 1, NewPlayer, NewGame ).

displayTurnInfo( Game ):-
	getCurrentPlayer( Game, CurrentPlayer ),
	getTurnIndex( Game, N ),
	write('Turn Number: '), write(N), nl,
	write('Current Player: '), displayPlayer( CurrentPlayer ), nl.

displayScore( White, Black ):-
	nl,	emoji(flag),
	write(' Game Over! '), 
	emoji(flag), nl,
	emoji('white'), write(' White Score: '), write(White), nl,
	emoji('black'), write(' Black Score: '), write(Black), nl.

displayWinner( White, Black ):-
	White > Black,
	emoji(trophy, 8), nl,
	emoji( trophy ),
	write(' White Wins '), 
	emoji(trophy), nl,
	emoji(trophy, 8), nl.

displayWinner( White, Black ):-
	Black > White,
	nl, emoji(trophy, 8), nl,
	emoji( trophy ),
	write(' Black Wins '), 
	emoji(trophy), nl,
	emoji(trophy, 8), nl.

displayWinner( White, Black ):-
	write('The match is a tie! '), nl.

displayPlayer('white'):- emoji('white'), write(' White ').
displayPlayer('black'):- emoji('black'), write(' Black ').

otherPlayer('white', 'black').
otherPlayer('black', 'white').
