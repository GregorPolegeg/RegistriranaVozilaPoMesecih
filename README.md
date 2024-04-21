# Načrt Projekta "Registrirana Vozila Po Mesecih"

## Idejni Načrt

Cilj projekta je razviti aplikacijo za analizo in vizualizacijo podatkov o registraciji vozil v Sloveniji. Glavne faze projekta vključujejo:

### 1. Zajem in Obdelava Podatkov

- Pridobivanje podatkov o prvih registriranih vozilih glede na mesece iz Odprtih podatkov Slovenije.
- Analiza registracij vozil glede na lokacije.
- Filtriranje rezultatov analize po različnih kriterijih, kot so znamka vozila, leto izdelave, moč motorja itd.
- Uporaba senzorja GPS za zaznavanje lokacije uporabnika.

### 2. Razvoj Uporabniškega Vmesnika

- Razvijanje uporabniškega vmesnika, ki bo omogočal preprosto navigacijo in uporabo funkcionalnosti filtriranja ter prikazovanja rezultatov analize.
- Upoštevanje uporabnikove izkušnje (UX) za zagotavljanje intuitivnega in prijaznega vmesnika.

### 3. Testiranje in Izboljševanje

- Testiranje aplikacije za preverjanje pravilnega delovanja in zadovoljevanje uporabnikovih potreb.
- Iterativno izboljševanje na podlagi povratnih informacij in rezultatov testiranja.

## Delovna Razdelitev

### Jaš

- Implementacija podatkovnega modela in vzpostavitev podatkovne baze.
- Implementacija spletne storitve za komunikacijo preko protokola HTTP.
- Razvoj spletnega vmesnika za vizualizacijo podatkov.
- Testiranje, komentiranje, dokumentiranje, popravljanje.

### Miha

- Shranjevanje obdelanih podatkov.
- Implementacija spletne storitve za vnos in branje podatkov iz podatkovne baze.
- Izdelava scrapperja v programskem jeziku Node.js za prenos podatkov iz spletnega vira.
- Popravki in izboljšave spletnega vmesnika.
- Testiranje, komentiranje, dokumentiranje, popravljanje.

### Gregor

- Vključitev podatkov iz različnih senzorjev v podatkovni model.
- Implementacija spletne storitve za komunikacijo preko protokola HTTP.
- Priprava predstavitvenega videa.
- Testiranje spletnega vmesnika.
- Testiranje, komentiranje, dokumentiranje, popravljanje.

## Cilj

Naš cilj je zagotoviti uporabnikom uporabno orodje, ki bo omogočilo hitro in enostavno pridobivanje informacij o številu registriranih vozil v določenem časovnem obdobju glede na želeno lokacijo in druge specifične parametre.

## Povezava na GitHub Repozitorij

[RegistriranaVozilaPoMesecih](https://github.com/GregorPolegeg/RegistriranaVozilaPoMesecih)
