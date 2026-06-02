/**
 * Mapa interativo via Leaflet + OpenStreetMap — funciona no Expo Go.
 * Renderiza praias (cor por lotação), UPAs (cor por status) e reports da comunidade.
 * Tocar em um marcador abre o popup; tocar numa praia navega para a tela de detalhes.
 *
 * Nota: SRI (integrity/crossorigin) removido intencionalmente — atributos CORS/SRI
 * bloqueiam o carregamento de recursos externos quando a WebView carrega HTML inline
 * (null origin). A segurança é mantida pela execução em contexto nativo isolado.
 */
import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { router } from 'expo-router';
import type { Beach, UPA, Report } from '@/lib/types';
import type { City } from '@/data/cities';

interface Props {
  city: City;
  beaches?: Beach[];
  upas?: UPA[];
  reports?: Report[];
}

// ── HTML gerado dinamicamente com dados embutidos como JSON ───────────────────
function buildLeafletHTML(city: City, beaches: Beach[], upas: UPA[], reports: Report[]): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#cae0f5}
#map{height:100vh;width:100%}
.lp .leaflet-popup-content-wrapper{
  border-radius:14px;
  box-shadow:0 4px 20px rgba(0,0,0,.18);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  padding:0;overflow:hidden
}
.lp .leaflet-popup-content{margin:12px 14px;font-size:13px;line-height:1.5}
.lp .leaflet-popup-tip-container{display:none}
.leaflet-control-attribution{font-size:9px!important;opacity:.7}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var D={
  city:{lat:${city.center.lat},lng:${city.center.lng},zoom:${city.zoom}},
  beaches:${JSON.stringify(beaches)},
  upas:${JSON.stringify(upas)},
  reports:${JSON.stringify(reports)}
};
var OCC={vazia:'#22c55e',moderada:'#f59e0b',lotada:'#ef4444'};
var UPAC={normal:'#22c55e',alerta:'#f59e0b',critico:'#ef4444'};
var RPTE={lotacao_praia:'🏖️',acidente:'🚨',blitz:'🚔',falta_agua:'💧',falta_luz:'⚡',outro:'📍'};

function post(t,id){
  if(window.ReactNativeWebView)
    window.ReactNativeWebView.postMessage(JSON.stringify({type:t,id:id}));
}

function mk(html,size){
  return L.divIcon({
    className:'',
    html:'<div style="width:'+size+'px;height:'+size+'px;border-radius:'+(size/2)+'px;'+html+'display:flex;align-items:center;justify-content:center;font-size:'+(size*0.44)+'px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)"></div>',
    iconSize:[size,size],
    iconAnchor:[size/2,size/2],
    popupAnchor:[0,-(size/2+6)]
  });
}

var map=L.map('map',{zoomControl:false})
  .setView([D.city.lat,D.city.lng],D.city.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',
  maxZoom:19
}).addTo(map);

L.control.zoom({position:'bottomright'}).addTo(map);

// Praias
D.beaches.forEach(function(b){
  var c=OCC[b.occupancy]||'#94a3b8';
  var style='background:'+c+'25;border:2.5px solid '+c+';';
  var pop='<strong>'+b.name+'</strong><br>'+
    b.occupancyPercent+'% ocupada · Água '+b.waterQuality;
  L.marker([b.lat,b.lng],{icon:mk(style,38)})
    .addTo(map)
    .bindPopup(pop,{className:'lp'})
    .on('click',function(){post('beach',b.id)});
});

// UPAs
D.upas.forEach(function(u){
  var c=UPAC[u.status]||'#94a3b8';
  var style='background:'+c+'25;border:2.5px solid '+c+';border-radius:8px;';
  var pop='<strong>'+u.name+'</strong><br>'+
    'Espera: <b>'+u.waitTime+' min</b> · '+u.patientsWaiting+' aguardando';
  L.marker([u.lat,u.lng],{icon:L.divIcon({
    className:'',
    html:'<div style="width:38px;height:38px;border-radius:9px;'+style+'display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)">🏥</div>',
    iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-22]
  })}).addTo(map).bindPopup(pop,{className:'lp'});
});

// Reports da comunidade
D.reports.forEach(function(r){
  var e=RPTE[r.type]||'📍';
  var pop='<strong>Reporte</strong><br>'+
    (r.description||r.type)+' · 👍 '+r.upvotes;
  L.marker([r.lat,r.lng],{icon:L.divIcon({
    className:'',
    html:'<div style="width:32px;height:32px;border-radius:50%;background:rgba(239,68,68,.15);border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2)">'+e+'</div>',
    iconSize:[32,32],iconAnchor:[16,16],popupAnchor:[0,-18]
  })}).addTo(map).bindPopup(pop,{className:'lp'});
});
</script>
</body>
</html>`;
}

// ── Componente ─────────────────────────────────────────────────────────────────
export function WebViewMap({ city, beaches = [], upas = [], reports = [] }: Props) {
  // Regenera apenas quando cidade muda ou a contagem de itens muda (evita flash no refetch)
  const html = useMemo(
    () => buildLeafletHTML(city, beaches, upas, reports),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [city.id, beaches.length, upas.length, reports.length],
  );

  function handleMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; id: string };
      if (msg.type === 'beach') router.push(`/praia/${msg.id}`);
    } catch {
      // mensagem malformada — ignorar
    }
  }

  return (
    <View
      style={{
        height: 320,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,119,182,0.12)',
      }}
    >
      <WebView
        source={{ html, baseUrl: 'https://unpkg.com' }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
        renderError={() => (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e8f4f8',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 36 }}>🗺️</Text>
            <Text style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
              {'Verifique sua conexão\npara carregar o mapa'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
