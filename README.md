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
```
{
  // (Påkrevd) Survey-id fra Task Analytics
  id: string
  
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

Eksempel:
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
  }
]
```

Undersøkelsen "12345" vises på alle sider under `https://www.nav.no/foo`, med unntak av sider under `https://www.nav.no/foo/bar`. <br/>
Undersøkelsen "67890" vises på alle bokmål og nynorsk sider for privatpersoner, med unntak av forsiden.

Dersom flere undersøkelser matcher på samme side, vil den første i lista vises. Mulighet for å sette flere undersøkelser på samme side, med prosentandels utvalg kommer snart!

Obs: Undersøkelser vises aldri på sider som benytter simple header!

## Henvendelser

Spørsmål knyttet til prosjektet kan rettes mot https://github.com/orgs/navikt/teams/personbruker

### For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen #team-personbruker
