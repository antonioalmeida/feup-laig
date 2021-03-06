:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                        Server                                                   %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Server Entry Point
server(Port) :-
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			% write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply),error(_,_),fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),	
	
	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).
	
read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).

% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here
:- include('game.pl').
:- include('parse.pl').
:- include('parseJS.pl').

% starting game
parse_input(initGame(singlePlayer, Playercolor, Difficulty), Game):- 
	initSinglePlayerGame(Temp, Playercolor, Difficulty), 
	parseGame(Temp, Game).

parse_input(initGame(multiPlayer, Playercolor, Difficulty), Game):- 
	initMultiplayerGame(Temp), 
	parseGame(Temp,Game).

parse_input(initGame(noPlayer, Playercolor, Difficulty), Game):- 
	initNoPlayerGame(Temp), 
	parseGame(Temp,Game).

% move validation
parse_input(checkMove(Game, Piece, X, Y), Result):-
	parseGameJS(Game, Temp),
	parsePiece(ParsedPiece, Piece), !, 
	checkMoveAux(Temp, ParsedPiece, X, Y, Result).

checkMoveAux(Game, Piece, X, Y, Result):-
	getCurrentPlayer(Game, Player),
	playerPiece(Player, Piece),
	validateMove(Game, Player, Piece, X, Y),
	Result = true.

checkMoveAux(Game, Piece, X, Y, Result):-
	Result = false.

% game progression
parse_input(makeMove(Game, Piece, X, Y), NewGame):- 
	parseGameJS(Game, Parsed), !,
	parsePiece(ParsedPiece, Piece), !,
	playGame(Parsed, ParsedPiece, X, Y, Temp), !,
	parseGame(Temp, NewGame).

% ai move
parse_input(makeMoveAI(Game), NewGame):-
	parseGameJS(Game, Parsed), !,
	playGameAI(Parsed, Temp), !,
	parseGame(Temp, NewGame).

% undo move
parse_input(undoMove(Game), NewGame):-
	parseGameJS(Game, Parsed), !,
	undoMove(Parsed, Temp), !,
	parseGame(Temp, NewGame).

% sample requests
parse_input(handshake, handshake).
parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).
