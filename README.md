P175B314 PROGRAMAVIMO INŽINERIJOS MODULIO TECHNOLOGINIS PROJEKTAS

Komanda Varžtai.

Projekto pavadinimas Blackjack.

Blackjack – kortų žaidimų, taip pat žinomas kaip „21“, nes pagrindinis žaidimo tikslas – surinkti kortų kombinaciją, kurios bendra vertė būtų kuo artimesnė skaičiui 21, bet jo neviršytų.

Žaidimo projektavimui naudota „Typescript“ kalba. Žaidimas naudoja „Docker“ duombazę(šios programos reikia norint paleisti žaidimą, nuoroda: https://www.docker.com/). Žaidimas internete paleistas su Fly.io.

„Visual studio code“ įvedus komandą:
 ### docker-compose up --build -d
Žaidimas paleidžiamas localhost:5173 puslapyje (pilna nuoroda http://localhost:5173/).

Pasijungus šį puslapį išmetamas prisijungimo langas kur galima įrašyti elektroninį paštą ir slaptažodį. Jei nėra paskyros yra mygtukas prisijungti, kurį paspaudus išmeta registracijos langas. Šiame lange galima įrašyti slapyvardį, elektroninį paštą ir slaptažodį. Susikūrus paskyra vėl einama į prisijungimo langa ir prisijungus einama į main meniu. Main meniu galima pradėti žaidimą, pažiūrėti profilio informaciją, nueiti į nustatymus, paskaityti taisykles arba atsijungti.
