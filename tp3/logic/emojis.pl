emoji(trophy):- put_code(127942), write(' ').
emoji(dice):- put_code(127922), write(' ').
emoji(flag):- put_code(127937), write(' ').
emoji(wave):- put_code(128075), write(' ').
emoji('white'):- put_code(9898), write(' ').
emoji('black'):- put_code(9899), write(' ').

emoji( _, 0).
emoji( Code, N ):-
	N1 is N-1,
	emoji( Code ),
	emoji( Code, N1 ).
