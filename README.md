# Config for dekoratøren
![Deploy til prod](https://github.com/navikt/nav-dekoratoren-config/actions/workflows/deploy-prod.yml/badge.svg)  ![Deploy til dev](https://github.com/navikt/nav-dekoratoren-config/actions/workflows/deploy-dev.yml/badge.svg)

Konfigurasjon for [nav-dekoratoren](https://github.com/navikt/nav-dekoratoren). Foreløpig brukes denne kun til oppsett av Task Analytics undersøkelser.

## Fremgangsmåte for endringer
Endringer på config-filer valideres og deployes ved push til master. Sjekk [deploy actions](https://github.com/navikt/nav-dekoratoren-config/actions) for eventuelle valideringsfeil.

Endringene vil normalt være aktive i dekoratøren i løpet av ett minutt.

### Task Analytics undersøkelser
**Prod: [/configs/prod/ta-config.json](https://github.com/navikt/nav-dekoratoren-config/blob/master/configs/prod/ta-config.json)** <br/>
**Dev: [/configs/dev/ta-config.json](https://github.com/navikt/nav-dekoratoren-config/blob/master/configs/dev/ta-config.json)**

En undersøkelse legges inn på dette formatet. Se også [JSON schema](https://github.com/navikt/nav-dekoratoren-config/blob/master/schemas/ta-config.schema.json).

Obs: Undersøkelser vises aldri på sider som benytter simple header!
```
{
  // (Påkrevd) Survey-id fra Task Analytics
  id: string
  
  // (Valgfri) Prosentandel av besøkende som skal få undersøkelsen (0-100). Default er 100
  selection?: number
  
  // (Valgfri) Tidsrom der undersøkelsen skal være tilgjengelig. Start og/eller end må være
  // strings som JS kan parse til et Date-objekt, f.eks. "2023-12-24" eller "2024-01-01T12:00"
  duration?: {
    start?: string,
    end?: string,
  }
  
  // (Valgfri) Liste over url'er som undersøkelsen skal vises/ikke vises på. Hvis denne ikke
  // er satt, vises undersøkelsen på alle sider
  urls?: Array<
    {
      url: string,    // Url (påkrevd)
      match: "exact" | "startsWith",  // Logikk for sammenligning (påkrevd)
      exclude: boolean    // Ekskluder denne url'en (valgfri, default er false)
    }
  >
  
  // (Valgfri) Liste over målgrupper undersøkelsen skal vises for. Hvis denn ikke er satt,
  // vises undersøkelsen for alle målgrupper
  audience?: Array<"privatperson" | "arbeidsgiver" | "samarbeidspartner">
  
  // (Valgfri) Liste over språk undersøkelsen skal vises for. Hvis denne ikke er satt,
  // vises undersøkelsen for alle språk
  language?: Array<"nb" | "nn" | "en" | "se" | "uk" | "ru" | "pl">
}
```

#### Eksempel
```json
[
  {
    "id": "12345",
    "urls": [
      {
        "url": "https://www.nav.no/foo",
        "match": "startsWith"
      },
      {
        "url": "https://www.nav.no/foo/bar",
        "match": "startsWith",
        "exclude": true
      }
    ]
  },
  {
    "id": "67890",
    "urls": [
      {
        "url": "https://www.nav.no",
        "match": "exact",
        "exclude": true
      }      
    ],
    "audience": ["privatperson"],
    "language": ["nb", "nn"]
  },
  {
    "id": "31337",
    "selection": 10,
    "duration": {
      "start": "2023-01-01"
    },
    "urls": [
      {
        "url": "https://www.nav.no",
        "match": "exact"
      }
    ]
  },
  {
    "id": "2357",
    "duration": {
      "start": "2023-01-30T08:00",
      "end": "2023-02-28"
    },
    "urls": [
      {
        "url": "https://www.nav.no/soknader",
        "match": "startsWith"
      }
    ]
  }
]
```

Undersøkelsen "12345" vises på alle sider under `https://www.nav.no/foo`, med unntak av sider under `https://www.nav.no/foo/bar`. <br/>
Undersøkelsen "67890" vises på alle bokmål og nynorsk sider for privatpersoner, med unntak av forsiden. <br/>
Undersøkelsen "31337" har 10% sannsynlighet for å vises på forsiden fra og med 1. jan 2023. <br/>
Undersøkelsen "2357" vises på sider under nav.no/soknader i det oppgitte tidsrommet. <br/>

#### Utvalg av undersøkelser
Det trekkes ut (opptil) en tilfeldig undersøkelse, basert på `selection`-verdien til undersøkelser som matcher for en side. Når en undersøkelse har vært med
i en trekning, vil vi ikke forsøke å trekke denne undersøkelsen igjen til samme bruker neste 30 dager (lagres med cookies). Dersom en undersøkelse blir valgt,
vises kun den valgte undersøkelsen for denne brukeren neste 30 dager.

Dersom summen av selection-verdiene er <100, trekkes et tall mellom 0-100 som avgjør hvilken undersøkelse som vises. Eksempel:
```json
[
  {
    "id": "123",
    "selection": 5
  },
  {
    "id": "456",
    "selection": 10
  }
]
```
Her er sannsynligheten 5% for "123", 10% for "456" og 85% for ingen undersøkelse vist, gitt at ingen av disse har vært med i en trekning for brukeren
siste 30 dager.

Dersom summen av selection-verdiene er >100, trekkes et tall mellom 0-(sum av verdiene), som avgjør hvilken undersøkelse som vises. Eksempel:
```json
[
  {
    "id": "123",
    "selection": 50
  },
  {
    "id": "456",
    "selection": 75
  }
]
```
Her er sannsynligheten 40% for "123" og 60% for "456", gitt at ingen av disse har vært med i en trekning for brukeren siste 30 dager.
 
## Henvendelser

Spørsmål knyttet til prosjektet kan rettes mot https://github.com/orgs/navikt/teams/personbruker

### For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-personbruker
