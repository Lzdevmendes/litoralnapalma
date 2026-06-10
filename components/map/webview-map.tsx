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
import { useUpvoteReport } from '@/hooks/useReports';
import { useLanguage } from '@/context/language-context';
import type { Beach, UPA, Report } from '@/lib/types';
import type { Translations } from '@/lib/i18n';
import type { City } from '@/data/cities';

interface Props {
  city: City;
  beaches?: Beach[];
  upas?: UPA[];
  reports?: Report[];
}

// ── HTML gerado dinamicamente com dados embutidos como JSON ───────────────────
function buildLeafletHTML(city: City, beaches: Beach[], upas: UPA[], reports: Report[], t: Translations): string {
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
  border-radius:16px;
  box-shadow:0 8px 32px rgba(0,77,102,.22);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  padding:0;overflow:hidden;border:1px solid rgba(0,119,182,.12)
}
.lp .leaflet-popup-content{margin:14px 16px;font-size:13px;line-height:1.6;color:#1e293b}
.lp .leaflet-popup-tip-container{display:none}
.leaflet-control-attribution{font-size:9px!important;opacity:.6;background:rgba(255,255,255,.7)!important;border-radius:6px!important}
.legend{position:absolute;left:10px;bottom:10px;z-index:500;
  background:rgba(255,255,255,.92);backdrop-filter:blur(8px);
  border-radius:16px;padding:10px 12px;
  box-shadow:0 4px 20px rgba(0,77,102,.18);border:1px solid rgba(0,119,182,.1);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:#334155}
.legend-row{display:flex;align-items:center;gap:7px;margin:3px 0}
.dot{width:9px;height:9px;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.popup-btn{margin-top:8px;border:0;border-radius:10px;
  background:linear-gradient(135deg,#0077b6,#023e8a);color:#fff;
  padding:8px 10px;font-weight:700;font-size:12px;width:100%;cursor:pointer}
</style>
</head>
<body>
<div id="map"></div>
<div class="legend">
  <div class="legend-row"><span class="dot" style="background:#22c55e"></span>${t.map.legend.beachEmpty}</div>
  <div class="legend-row"><span class="dot" style="background:#f59e0b"></span>${t.map.legend.beachModerate}</div>
  <div class="legend-row"><span class="dot" style="background:#ef4444"></span>${t.map.legend.beachCrowded}</div>
  <div class="legend-row"><span style="font-size:13px">🏥</span>${t.map.legend.upa}</div>
</div>
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
var RPTL={lotacao_praia:'${t.map.report.types.lotacao_praia}',acidente:'${t.map.report.types.acidente}',blitz:'${t.map.report.types.blitz}',falta_agua:'${t.map.report.types.falta_agua}',falta_luz:'${t.map.report.types.falta_luz}',outro:'${t.map.report.types.outro}'};
var WATERQ={boa:'${t.map.water.boa}',regular:'${t.map.water.regular}',impropia:'${t.map.water.impropia}'};
var L10N={occupied:'${t.map.occupied}',waterLabel:'${t.map.waterLabel}',wait:'${t.upa.wait}',waiting:'${t.upa.waiting}',upvoteBtn:'${t.map.report.upvoteBtn}',upvotes:'${t.map.report.upvotes}',fallback:'${t.map.report.fallback}'};

function post(t,id){
  if(window.ReactNativeWebView)
    window.ReactNativeWebView.postMessage(JSON.stringify({type:t,id:id}));
}
function esc(v){
  return String(v == null ? '' : v)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
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

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
  attribution:'© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
  subdomains:'abcd',
  maxZoom:20
}).addTo(map);

L.control.zoom({position:'bottomright'}).addTo(map);

// Praias
D.beaches.forEach(function(b){
  var c=OCC[b.occupancy]||'#94a3b8';
  var style='background:'+c+'25;border:2.5px solid '+c+';';
  var pop='<strong>'+b.name+'</strong><br>'+
    b.occupancyPercent+'% '+L10N.occupied+' · '+L10N.waterLabel+' '+(WATERQ[b.waterQuality]||b.waterQuality);
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
    L10N.wait+': <b>'+u.waitTime+' min</b> · '+u.patientsWaiting+' '+L10N.waiting;
  L.marker([u.lat,u.lng],{icon:L.divIcon({
    className:'',
    html:'<div style="width:38px;height:38px;border-radius:9px;'+style+'display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)">🏥</div>',
    iconSize:[38,38],iconAnchor:[19,19],popupAnchor:[0,-22]
  })}).addTo(map).bindPopup(pop,{className:'lp'});
});

// Reports da comunidade
D.reports.forEach(function(r){
  var e=RPTE[r.type]||'📍';
  var label=RPTL[r.type]||L10N.fallback;
  var pop='<strong>'+e+' '+label+'</strong><br>'+
    '<span>'+esc(r.description||label)+'</span><br>'+
    '<span style="color:#64748b">👍 '+r.upvotes+' '+L10N.upvotes+'</span>'+
    '<button class="popup-btn" onclick="post(\\'upvote\\',\\''+r.id+'\\')">'+L10N.upvoteBtn+'</button>';
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
  const { mutate: upvote } = useUpvoteReport();
  const { locale, t } = useLanguage();
  const signature = useMemo(
    () => JSON.stringify({
      b: beaches.map((b) => [b.id, b.occupancy, b.occupancyPercent, b.waterQuality]),
      u: upas.map((u) => [u.id, u.status, u.waitTime, u.patientsWaiting]),
      r: reports.map((r) => [r.id, r.type, r.description, r.upvotes, r.expiresAt]),
    }),
    [beaches, upas, reports],
  );

  // Regenera quando dados visíveis mudam, incluindo upvotes, status dinâmicos e idioma.
  const html = useMemo(
    () => buildLeafletHTML(city, beaches, upas, reports, t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [city.id, city.zoom, signature, locale],
  );

  function handleMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; id: string };
      if (msg.type === 'beach') router.push(`/praia/${msg.id}`);
      if (msg.type === 'upvote') upvote(msg.id);
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
              {t.map.loadError}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
