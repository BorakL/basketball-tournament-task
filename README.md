# Simulacija Košarkaškog Turnira

## Pregled

Ovaj projekat simulira košarkaški turnir za Olimpijske igre koristeći JavaScript. Simulacija obuhvata:

- **Grupnu fazu:** Timovi igraju međusobne utakmice, a plasman se određuje na osnovu bodova, međusobnih rezultata i razlike u poenima.
- **Eliminacionu fazu:** Timovi prolaze u nokaut fazu, gde se igraju četvrtfinala, polufinala i finale, uključujući utakmicu za treće mesto.

## Funkcionalnosti

- Simulacija utakmica grupne faze i određivanje plasmana.
- Rangiranje timova na osnovu bodova, međusobnih rezultata i razlike u poenima.
- Generisanje i prikaz parova za nokaut fazu.
- Prikaz konačnih rezultata i osvajača medalja.

## Datoteke

- `groups.json`: Podaci o timovima (nazivi, ISO-3166 kodovi, FIBA rang).
- `exhibitions.json` (Bonus): Rezultati prijateljskih utakmica za proračun forme timova.

## Postavljanje

1. **Kloni repozitorijum:**

    ```bash
    git clone https://github.com/BorakL/basketball-tournament-task.git
    cd basketball-tournament-task
    ```

2. **Pokreni aplikaciju:**

    ```bash
    npm start
    ```

## Kako Radi

### Grupna Faza

1. **Simulacija Utakmica:** Svaki tim igra protiv ostalih u grupi.
2. **Rangiranje Timova:** Rangiraju se na osnovu bodova, međusobnih rezultata i razlike u poenima.
3. **Prikaz Rezultata:** Rezultati utakmica i konačan plasman u grupama.

### Eliminaciona Faza

1. **Žreb:** Timovi se dele u šešire i prave parove za četvrtfinale.
2. **Simulacija Utakmica:** Igraju se četvrtfinala, polufinala i finale.
3. **Prikaz Rezultata:** Rezultati nokaut faze i medalje.

## Napomene

- Potrebna je verzija Node.js (v20.17.0).
- Modifikujte `groups.json` i `exhibitions.json` za različite scenarije.
