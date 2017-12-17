% parse game for output
parseGameJS(Game, Output):-
	getGameType(Game, Type),
	parseGameType(ParsedGameType, Type),
	write('cenas 6'),nl,

	getDifficulty(Game, Difficulty),
	parseDifficulty(Difficulty, ParsedDifficulty),
	write('cenas 7'),nl,

	getCurrentPlayer(Game, Player),
	parsePlayer(ParsedPlayer, Player),

	write('cenas 8'),nl,
	getAIPlayer(Game, AIPlayer),
	parsePlayer(ParsedPlayer, AIPlayer),
	write('cenas 1'),nl,

	getPlayedPieces(Game, Played),
	parsePlayedPiecesJS(Played, ParsedPlayedPieces),

	write('cenas'),nl,

	getBoard(Game, Board),
	parseBoardJS(Board, ParsedBoard),
	write('cenas2'),nl,

	replace(Game, 0, ParsedBoard, TempGame),
	replace(TempGame, 1, ParsedPlayer, TempGame2),
	replace(TempGame2, 5, ParsedAIPlayer, TempGame3),
	replace(TempGame3, 6, ParsedPlayedPieces, TempGame4),

	write('cenas 3'),nl,
	replace(TempGame4, 10, ParsedGameType, TempGame5),
	replace(TempGame5, 11, ParsedDifficulty, Output).

parsePlayedPiecesJS(Played, Output):-
	parsePlayedPiecesJSAux(Played, [], Output).

parsePlayedPiecesJSAux([], Parsed, Parsed).
parsePlayedPiecesJSAux([Move|Rest], Aux, Parsed):-
	parseMoveJS(Move, ParsedMove),
	append(Aux, [ParsedMove], NextAux),
	parsePlayedPiecesJSAux(Rest, NextAux, Parsed).

parseMoveJS([Player,Piece,X,Y], ParsedPlayer-ParsedPiece-X-Y):-
	parsePlayer(ParsedPlayer, Player),
	parsePiece(ParsedPiece, Piece).

parseBoardJS(Board, Output):-
	parseBoardAuxJS(Board, [], Output),
	write(Output).

parseBoardAuxJS([], Parsed, Parsed).
parseBoardAuxJS([Line|Rest], Aux, Parsed):-
	parseBoardLineJS(Line, [], ParsedLine),
	append(Aux, [ParsedLine], NextAux),
	parseBoardAuxJS(Rest, NextAux, Parsed).

parseBoardLineJS([], Output, Output).
parseBoardLineJS([Piece|Tail], Aux, Output):-
	parsePiece(ParsedPiece, Piece),
	append(Aux, [ParsedPiece], NextAux),
	parseBoardLineJS(Tail, NextAux, Output).

