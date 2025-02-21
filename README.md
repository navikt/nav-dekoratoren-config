# Config for dekoratøren

Konfigurasjon for [nav-dekoratoren](https://github.com/navikt/nav-dekoratoren). Foreløpig brukes denne kun til oppsett av Task Analytics undersøkelser.

## Fremgangsmåte for endringer
Endringer på config-filer valideres og deployes ved push til main. Sjekk [deploy actions](https://github.com/navikt/nav-dekoratoren-config/actions) for eventuelle valideringsfeil.

Endringer vil normalt være aktive i dekoratøren i løpet av ett minutt.

### Task Analytics undersøkelser
**Prod: [/configs/prod/ta-config.json](https://github.com/navikt/nav-dekoratoren-config/blob/master/configs/prod/ta-config.json)** <br/>
**Dev: [/configs/dev/ta-config.json](https://github.com/navikt/nav-dekoratoren-config/blob/master/configs/dev/ta-config.json)**

En undersøkelse legges inn på dette formatet. Se også [JSON schema](https://github.com/navikt/nav-dekoratoren-config/blob/master/schemas/ta-config.schema.json).
```typescript
type TaConfig = Array<{
  // (Påkrevd) Survey-id fra Task Analytics
  id: string

  // (Valgfri) Prosentandel av besøkende som skal få undersøkelsen (0-100). Default er 100
  selection?: number
  
  // (Valgfri) Tidsrom der undersøkelsen skal kunne vises. Default er ingen tidsbegrensning.
  // Start/end må være date-time strings som kan parses av Javascript, og er exclusive med millisec presisjon.
  // Benytter norsk tidssone. 
  duration?: {
    start?: string,
    end?: string,
  }
  
  // (Valgfri) Liste over url'er som undersøkelsen skal kunne vises på, eller ekskluderes fra.
  // Som default vises undersøkelsen på alle sider. Dersom alle url'er har satt exclude=true,
  // vises undersøkelsen på alle sider unntatt disse.
  urls?: Array<
    {
      // Url (påkrevd)
      url: string,
      // Logikk for sammenligning (påkrevd)
      match: "exact" | "startsWith",
      // Ekskluder denne url'en (valgfri, default er false)
      exclude?: boolean
    }
  >
  
  // (Valgfri) Liste over målgrupper som undersøkelsen skal vises for.
  // Som default vises undersøkelsen for alle målgrupper.
  audience?: Array<"privatperson" | "arbeidsgiver" | "samarbeidspartner">
  
  // (Valgfri) Liste over språk som undersøkelsen skal vises for.
  // Som default vises undersøkelsen for samtlige språk.
  language?: Array<"nb" | "nn" | "en" | "se" | "uk" | "ru" | "pl">
}>
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
Undersøkelsen "31337" vises for 10% av besøkende på forsiden, fra 1/1/2023. <br/>
Undersøkelsen "2357" vises på sider under nav.no/soknader fra 30/1/2023 kl. 8:00, til 28/2/2023 kl. 0:00. <br/>

Obs: Undersøkelser vises aldri på sider som benytter simple header!

#### Utvelging av undersøkelser
Det trekkes ut (inntil) en tilfeldig undersøkelse, basert på `selection`-verdien til undersøkelser som matcher for en side. Når en undersøkelse har vært med
i en trekning, vil vi ikke forsøke å trekke denne undersøkelsen igjen til samme bruker neste 30 dager. Dersom en undersøkelse blir valgt for en bruker,
vil vi kun vise denne undersøkelsen for den aktuelle brukeren neste 30 dager. Trekninger huskes med cookies.

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

## Deploy til dev-miljø

Med workflow_dispatch trigger: <br>
[Deploy to dev](https://github.com/navikt/nav-dekoratoren-config/actions/workflows/deploy-dev.yml) -> Run workflow -> Velg branch -> Run workflow

## Prodsetting

Lag en PR til main, og merge inn etter godkjenning (En automatisk release vil oppstå ved deploy til main)

## Henvendelser

Spørsmål knyttet til prosjektet kan rettes mot https://github.com/orgs/navikt/teams/personbruker

### For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-personbruker
