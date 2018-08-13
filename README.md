# PokeLifeScript

* AutoGo czyli automatyczne wyklinanie punktów w wybraną dzicz:
  - Wybór w którą dzicz będzie klikał
  - Wybór jakiego pokemona będzie używał, w tym EXP Mode:  zależnie od levelu spotkanego pozwala wybrać który pokemon zostanie użyty
  - Automatyczne leczenie, gdy poziom życia pokemona spadnie poniżej X procent
  - Zatrzymuje się, gdy spotka Shiny Pokemona
  - Opcionalne zatrzymywanie sie, gdy spotka pokemona niezłapanego
* Rozbudowany widok plecaka:
  - Nowy widok zakładki TM
  - Szybkie rozkładanie przedmiotów
* Przypomnienia o nieodbytej opiece.
* Alerty shiny - pokazuje ostatnie 3 spotkane shiny.

Instrukcja instalacji
---------

1. Zainstaluj dodatek http://tampermonkey.net/
2. Po zainstalowaniu wejdż w link https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js i kliknij przycisk Zainstaluj


Changelog
---------
1.8.7 (2018-08-13)
* Dodanie przycisku cofnij, przeniesienie wyboru dziczy na lewą stronę menu

1.8.6 (2018-08-12)
* Dodanie potwierdzenia przy zakupach w Szybkim Sklepie

1.8.5 (2018-08-12)
* Poprawki wyglądowe, został usunięty style3

1.8.4 (2018-08-12)
* Dodanie Niebieskich napoi, niebieskich jagód oraz stunballa za Yeny

1.8.3 (2018-08-11)
* Dodanie Stunballa do Szybkiego Sklepu

1.8.2 (2018-08-10)
* Ponowne autouzupełnienie pola po zakupie PZ na widoku wymiany

1.8.1 (2018-08-10)
* Przeniesienie sklepu na zapytania Ajax. Gdy jestes na widoku łapania pokemona zwiększa ilość balli do wyboru.

1.8 (2018-08-10)
* Dodano Szybki Sklep

1.7.22 (2018-08-08)
* Poprawka do do zatrzymywania przy pokach niezłapanych. Od teraz nie zatrzymuje się gdy pokemon jest powyżej 50 poziomu lub ma trudność złapania X

1.7.21 (2018-08-03)
* Gdy jest zacznaczony input lub textarea nie działa Go Button na spacji

1.7.19 (2018-07-30)
* CTRL + SPACE zmienia czy jest aktywny GO Button na spacji

1.7.18 (2018-07-29)
* Poprawka do PPM na GO Button - nie zapisywało zmian do local storage
* Dodanie różnych kolorów przycisków do szybkiego rozkładania przedmiotów, w zależności od poziomu przedmiotu. Źółte dla poziomu II oraz czerwone dla poziomu III.

1.7.17 (2018-07-26)
* Poprawienie wyglądu ustawień v2
* Poprawienie logowania aktywności użytkowników (od teraz zapisuje z dokładnością do 1m)
* Poprawka na wyświetlanie aktywności na czacie
* Kliknięcie PPM na GO Button zmienia czy jest aktywny GO Button na spacji + dodanie wyszarzenia przycisku, gdy Go Button na spacji jest aktywny

1.7.13 (2018-07-25)
* Poprawienie wyglądu ustawień
* Exp mode pokazywany po aktywowaniu

1.7.11 (2018-07-24)
* dodanie nowego stylu

1.7.10 (2018-07-24)
* dodanie obsługi dziczy eventowej przy zatrzymywaniu AutoGo
* drobne poprawki w kodzie

1.7.9 (2018-07-24)
* poprawka na logowanie do czatu, ładuje sie teraz o 2s szybciej

1.7.8 (2018-07-24)
* dodanie oznaczenia na czacie, gdy użytkownik był aktywny w ciągu ostatnich 30m (pokazuje tylko informacje o użytkownikach skryptu)

1.7.7 (2018-07-18)
* dodanie nowego rodzaju balla, mixed2 (połączenie nestballa, nightballa oraz greatballa)

1.7.6 (2018-07-18)
* dodanie przekierowanie na github po kliknięciu w numer wersji

1.7.5 (2018-07-18)
* dodanie przycisku do szybkiego rozkładania przedmiotów na zakładce Plecak/Trzymane
