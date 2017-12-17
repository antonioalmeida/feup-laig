start:-
	clearScreen,
	emoji(wave), 
	write(' Welcome to Xadrersi '), 
	emoji(wave), nl, nl,

	write('Main Menu'), nl,
	write('1 - Multiplayer match.'), nl,
	write('2 - Single Player match.'), nl,
	write('3 - No Player match.'), nl,
	write('4 - Exit.'), nl,
	get_char( N ),
	get_char( _ ),
	clearScreen,
	chooseDifficultyMenu( N ), !.

% Multiplayer game - no difficulty
chooseDifficultyMenu( '1' ):-
	startGame( 'multiPlayer', Game ), !,
	playGame( Game ).

% Single Player game
chooseDifficultyMenu( '2' ):-
	write('Single Player '), nl, 
	write('Choose your difficulty:'), nl,
	write('1 - Easy'), nl,
	write('2 - Medium'), nl,
	write('3 - Hard (experimental, very slow)'), nl,
	write('4 - Go back.'), nl,
	get_char( NDifficulty ),
	get_char( _ ),

	chooseDifficulty( NDifficulty, Difficulty ),
	clearScreen,
	chooseColorMenu( Difficulty ).

% No Player game - always medium
chooseDifficultyMenu( '3' ):-
	startGame( 'noPlayer', Game ), !,
	write('startGame'), nl,
	playGame( Game ).

% exit
chooseDifficultyMenu( '4').

% case with invalid input
chooseDifficultyMenu( _ ):- !, start.

chooseDifficulty( '1', 'easy' ).
chooseDifficulty( '2', 'medium' ).
chooseDifficulty( '3', 'hard' ).

chooseColorMenu( Difficulty ):-
	write('Choose your color:'), nl,
	write('1 - White'), nl,
	write('2 - Black'), nl,
	write('3 - Go Back'), nl,
	get_char( NColor),
	get_char( _ ),
	chooseColor( NColor, PlayerColor ),
	startAndPlayGame( Difficulty, PlayerColor ).

% This is switched, actually choosing AI's color
chooseColor( '1', 'black' ).
chooseColor( '2', 'white').

startAndPlayGame( Difficulty, PlayerColor ):-
	startGame( 'singlePlayer', Difficulty, PlayerColor, Game ),
	clearScreen, !,
	playGame( Game ).

% case with invalid input
startAndPlayGame( _, _ ):-
	!,
	start.

startGame( 'singlePlayer', Difficulty, PlayerColor, Game ):-
	initSinglePlayerGame( Game, PlayerColor, Difficulty ).

startGame( 'multiPlayer', Game ):-
	initMultiplayerGame( Game ).

startGame( 'noPlayer', Game ):-
	initNoPlayerGame( Game ).
