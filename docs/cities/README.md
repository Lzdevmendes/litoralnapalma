# docs/cities/ — Guia de dados por cidade

Cada arquivo documenta os dados **fixos** e **dinâmicos** de uma cidade coberta pelo app.

## Estrutura

```
docs/cities/
  caraguatatuba.md
  sao-sebastiao.md
  ubatuba.md
  ilhabela.md
```

## Como manter

| Tipo | Arquivo-fonte | Quando atualizar |
|---|---|---|
| Praias (coords, amenidades) | `data/cities.ts → beaches[]` | Quando houver mudança física na praia |
| UPA (endereço, telefone) | `data/cities.ts → upas[]` | Quando mudar endereço ou telefone |
| Postos (preço, coords) | `data/cities.ts → gasStations[]` | Semanalmente (ANP publica às quintas) |
| Ônibus (horários, rotas) | `data/cities.ts → busLines[]` | A cada mudança de quadro horário EMTU |
| Restaurantes | `data/cities.ts → restaurants[]` | Quando fecharem/abrirem |
| Atrações | `data/cities.ts → attractions[]` | Quando houver mudança de acesso ou taxa |
| Balneabilidade | API CETESB (automático) | Não editar manualmente |
| Trânsito | Google Routes API (automático) | Não editar manualmente |
| Clima | OpenWeather API (automático) | Não editar manualmente |

## CETESB — ponto IDs

Os IDs internos das praias mapeiam para os nomes dos pontos de coleta do ArcGIS da CETESB.
Consultar `lib/cetesb.ts → CETESB_NAME_MAP` para o mapeamento completo.

## Convenção de URLs de localização (`mapsUrl`)

**Nunca usar coordenada crua** (`?q=-23.xxx,-45.xxx`) — o Maps abre em ponto sem nome.

Formato correto para todos os campos `mapsUrl` em `data/cities.ts`:

```
https://maps.google.com/?q=Nome+do+Local,+Cidade,+SP&ll=lat,lng
```

- `q=Nome...` → Google Maps busca o lugar pelo nome (mostra o nome correto ao usuário)
- `&ll=lat,lng` → âncora geográfica — se o nome não for encontrado, exibe o pin nas coordenadas

Para botões de "Como chegar" em código (praias, postos, UPAs), usar `mapsNavigationUrl(lat, lng, name)` de `lib/utils.ts`:
- iOS: `maps:?q=Name&ll=lat,lng` (Apple Maps)
- Android: `geo:lat,lng?q=lat,lng(Name)` (Google Maps)
- Web: `https://maps.google.com/?q=Name&ll=lat,lng`

## Preços de combustível

ANP publica dados toda quinta-feira em [gov.br/anp](https://gov.br/anp).
Última atualização nos dados do app: **2026-03-31**.
Atualizar campo `fuels[].price` e `fuels[].updatedAt` em `data/cities.ts → gasStations[]`.
