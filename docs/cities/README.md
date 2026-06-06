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

Os `pontoId` das praias mapeiam para os IDs do ArcGIS da CETESB (campo `NOME_PONTO`).
Consultar `lib/cetesb.ts → CETESB_MAPPING` para a lista completa.
