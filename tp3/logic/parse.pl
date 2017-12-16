% parse game for output
parseGame(Game, Output):-
	getGameType(Game, Type),
	parseGameType(Type, ParsedGameType),

	getDifficulty(Game, Difficulty),
	parseDifficulty(Difficulty, ParsedDifficulty),

	getCurrentPlayer(Game, Player),
	parsePlayer(Player, ParsedPlayer),

	getAIPlayer(Game, AIPlayer),
	parsePlayer(AIPlayer, ParsedAIPlayer),

	getPlayedPieces(Game, Played),
	parsePlayedPieces(Played, ParsedPlayedPieces),

	getBoard(Game, Board),
	parseBoard(Board, ParsedBoard),

	replace(Game, 0, ParsedBoard, TempGame),
	replace(TempGame, 1, ParsedPlayer, TempGame2),
	replace(TempGame2, 5, ParsedAIPlayer, TempGame3),
	replace(TempGame3, 6, ParsedPlayedPieces, TempGame4),
	replace(TempGame4, 10, ParsedGameType, TempGame5),
	replace(TempGame5, 11, ParsedDifficulty, Output).

parseGameType('singlePlayer', 0).
parseGameType('multiPlayer', 1).
parseGameType('noPlayer', 2).

parseDifficulty('easy', 0).
parseDifficulty('medium', 1).
parseDifficulty('hard', 2).
parseDifficulty(_, -1). % for matches without difficulty (multiplayer)

parsePlayer('white', 0).
parsePlayer('black', 1).

parsePlayedPieces(Played, Output):-
	parsePlayedPiecesAux(Played, [], Output).

parsePlayedPiecesAux([], Parsed, Parsed).
parsePlayedPiecesAux([Move|Rest], Aux, Parsed):-
	parseMove(Move, ParsedMove),
	append(Aux, [ParsedMove], NextAux),
	parsePlayedPiecesAux(Rest, NextAux, Parsed).

parseMove(Player-Piece-X-Y, ParsedPlayer-ParsedPiece-X-Y):-
	parsePlayer(Player, ParsedPlayer),
	parsePiece(Piece, ParsedPiece).

parseBoard(Board, Output):-
	parseBoardAux(Board, [], Output),
	write(Output).

parseBoardAux([], Parsed, Parsed).
parseBoardAux([Line|Rest], Aux, Parsed):-
	parseBoardLine(Line, [], ParsedLine),
	append(Aux, [ParsedLine], NextAux),
	parseBoardAux(Rest, NextAux, Parsed).

parseBoardLine([], Output, Output).
parseBoardLine([Piece|Tail], Aux, Output):-
	parsePiece(Piece, ParsedPiece),
	append(Aux, [ParsedPiece], NextAux),
	parseBoardLine(Tail, NextAux, Output).

parsePiece(0, 0).
%white pieces
parsePiece('K', 1). % king
parsePiece('Q', 2). % queen
parsePiece('R', 3). % rook
parsePiece('B', 4). % bishop
parsePiece('N', 5). % knight

%black pieces
parsePiece('k', 6). % king
parsePiece('q', 7). % queen
parsePiece('r', 8). % rook
parsePiece('b', 9). % bishop
parsePiece('n', 10). % knight