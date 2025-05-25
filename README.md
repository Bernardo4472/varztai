P175B314 PROGRAMAVIMO INŽINERIJOS MODULIO TECHNOLOGINIS PROJEKTAS

Komanda Varžtai.

Projekto pavadinimas Blackjack.

Blackjack – kortų žaidimų, taip pat žinomas kaip „21“, nes pagrindinis žaidimo tikslas – surinkti kortų kombinaciją, kurios bendra vertė būtų kuo artimesnė skaičiui 21, bet jo neviršytų.

Žaidimo projektavimui naudota „Typescript“ kalba. Žaidimas naudoja „Docker“ duombazę(šios programos reikia norint paleisti žaidimą, nuoroda: https://www.docker.com/). Žaidimas internete paleistas su Fly.io.

„Visual studio code“ konsolėje įvedus komandą:
 ### docker-compose up --build -d
Žaidimas paleidžiamas localhost:5173 puslapyje (pilna nuoroda http://localhost:5173/).

Pasijungus šį puslapį išmetamas prisijungimo langas kur galima įrašyti elektroninį paštą ir slaptažodį. Jei nėra paskyros yra mygtukas prisijungti, kurį paspaudus išmeta registracijos langas. Šiame lange galima įrašyti slapyvardį, elektroninį paštą ir slaptažodį. Susikūrus paskyra vėl einama į prisijungimo langa ir prisijungus einama į main meniu. Main meniu galima pradėti žaidimą, pažiūrėti profilio informaciją, nueiti į nustatymus, paskaityti taisykles arba atsijungti. Profilio puslapyje galima matyti elektroninį paštą, slapyvardį, turimų pinigų kiekį ir žaidėjo statistiką(laimėjimų, pralaimėjimų ir žaistų partijų kiekį). Šiame puslapyje taip pat galima papildyti balansą. Nustatymų puslapyje galima keisti slapyvardį, kuris išsaugomas paspaudus mygtuką „Save Changes“. Taisyklių puslapyje aprašyta žaidimo taisyklės. „Atsijungti“ mygtuką paspaudus atsijungiama nuo paskyros. Paspaudus mygtuką „Žaisti“ atsidaro langas, kuriame galima sukurti naują kambarį, prisjungti prie kambario arba grįžti atgal į main meniu. Kai sukuriamas kambarys, sugeneruojama kambario ID, su kuriuo kitas gali prisijungti prie jau sukurto kambario. Žaidmo puslapyje galima įsijungti fono muzika, jos garsumą reguliuoti su slider, taip pat galima išeiti iš kambario. Viduryje yra stalas su 7 žaidėjų vietomis ir krupje, žaidėjas visada bus prieš krupje. Žaidimas prasideda, kai žaidėjas pastato pinigų sumą. Jis gauna kortas ir tada gali traukti dar vieną kortą, pasilikti su esamom kortom arba dvigubinti. Žaidėjo ėjimas baigiasi kai jis lieka su esamom kortomis arba ištraukia daugiau nei 21. Jei prisijungia kitas žaidėjas jis laukia kol kitas žaidėjas pabaigs partija ir tada prisijungia prie žaidimo. Žaidimo puslapyje taip pat yra registruojami žaidėjų veiksmai, kurie rodomi po žaidmo stalu.

Žaidėjo slapyvardis, elektroninis paštas, slaptažodis ir balansas yra saugomi globaliai.
