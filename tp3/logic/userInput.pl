:- use_module(library(lists)).

% valid rows
validRow('a').
validRow('b').
validRow('c').
validRow('d').
validRow('e').
validRow('f').
validRow('g').
validRow('h').

% valid pieces
validPiece('k').
validPiece('K').
validPiece('q').
validPiece('Q').
validPiece('b').
validPiece('B').
validPiece('r').
validPiece('R').
validPiece('n').
validPiece('N').

% rows to ints
getIndexFromRow('a', 0).
getIndexFromRow('b', 1).
getIndexFromRow('c', 2).
getIndexFromRow('d', 3).
getIndexFromRow('e', 4).
getIndexFromRow('f', 5).
getIndexFromRow('g', 6).
getIndexFromRow('h', 7).

readMoveFromUser(Player, FinalPiece, X, Y):-
	nl, write('Choose your move:'),nl,
	repeat,
	write('Use the format PieceRowCol. Example : ke4'), nl,
	read_line(Move),
	validInput(Move, PieceChar, Row, Col),
	getPiece(Player, PieceChar, FinalPiece),
	getIndexFromRow(Row, X),
	Y is 8-Col.

validInput(Move, PieceChar, Row, Col):-
	length(Move, 3),
	elementAt(0, Move, Piece),
	write(Piece), nl,
	char_code(PieceChar, Piece),
	validPiece(PieceChar),
	elementAt(1, Move, RowTemp),
	char_code(RowTemp2, RowTemp),
	toLowercase(RowTemp2, Row),
	validRow(Row),
	elementAt(2, Move, ColTemp),
	Col is ColTemp - 48, %48 is ASCII of 0
	Col > 0,
	Col =< 8.

validInput(_, PieceChar, Row, Col):-
	write('Invalid move format. Please try again.'), nl, fail.

getPiece(black, PieceChar, FinalPiece):-
	toLowercase( PieceChar, FinalPiece).

getPiece(white, PieceChar, FinalPiece):-
	toUppercase(PieceChar, FinalPiece).

toUppercase(L, U):-
	atom_codes(L, [ NL | _] ),
	NL > 90,
	!,
	NX is NL-32,
	atom_codes(U, [ NX ] ).

toUppercase(L, L).

toLowercase(U, L):-
	atom_codes(U, [ NU | _] ),
	NU < 90,
	!,
	NX is NU+32,
	atom_codes(L, [ NX ] ).

toLowercase(U, U).
