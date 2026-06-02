/**
 * Modal de reporte com 3 etapas:
 *   1. Selecionar tipo de ocorrência
 *   2. Escolher localização: GPS atual ou pin no mapa Leaflet
 *   3. Descrição + envio
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSubmitReport } from '@/hooks/useReports';
import { canSubmitReport, recordReportSubmission, formatCooldown } from '@/lib/report-rate-limit';
import type { City } from '@/data/cities';
import type { ReportType } from '@/lib/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  city: City;
}

interface LatLng { lat: number; lng: number }

const REPORT_TYPES: { type: ReportType; emoji: string; label: string }[] = [
  { type: 'lotacao_praia', emoji: '🏖️', label: 'Praia Lotada' },
  { type: 'acidente',      emoji: '🚨', label: 'Acidente' },
  { type: 'blitz',         emoji: '🚔', label: 'Blitz' },
  { type: 'falta_agua',    emoji: '💧', label: 'Falta d\'água' },
  { type: 'falta_luz',     emoji: '⚡', label: 'Falta de luz' },
  { type: 'outro',         emoji: '📍', label: 'Outro' },
];

// Tipos que fazem sentido abrir no Waze para navegação de referência
const WAZE_TYPES: ReportType[] = ['acidente', 'blitz'];

/** Mini-mapa Leaflet para seleção de pin — retorna coordenadas via postMessage */
function buildPickerHTML(center: LatLng, pinLat?: number, pinLng?: number): string {
  const hasPinStr = pinLat != null && pinLng != null ? 'true' : 'false';
  const pinLatStr = pinLat ?? center.lat;
  const pinLngStr = pinLng ?? center.lng;
  return `<!DOCTYPE html><html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{height:100%;width:100%}
#hint{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);
  background:rgba(0,119,182,0.9);color:#fff;padding:6px 14px;
  border-radius:20px;font-size:12px;font-family:sans-serif;pointer-events:none;z-index:999}
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Toque para marcar a localização</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLs=" crossorigin=""></script>
<script>
var map=L.map('map',{zoomControl:false}).setView([${center.lat},${center.lng}],14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap',maxZoom:19
}).addTo(map);
L.control.zoom({position:'bottomright'}).addTo(map);

var pinIcon=L.divIcon({
  className:'',
  html:'<div style="width:32px;height:32px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',
  iconSize:[32,32],iconAnchor:[16,32],popupAnchor:[0,-32]
});

var marker=null;
var hasPin=${hasPinStr};
if(hasPin){
  marker=L.marker([${pinLatStr},${pinLngStr}],{icon:pinIcon}).addTo(map);
  map.setView([${pinLatStr},${pinLngStr}],15);
  document.getElementById('hint').textContent='Arraste ou toque para reposicionar';
}

map.on('click',function(e){
  var lat=e.latlng.lat, lng=e.latlng.lng;
  if(marker) map.removeLayer(marker);
  marker=L.marker([lat,lng],{icon:pinIcon}).addTo(map);
  document.getElementById('hint').textContent='📍 Localização marcada';
  if(window.ReactNativeWebView)
    window.ReactNativeWebView.postMessage(JSON.stringify({lat:lat,lng:lng}));
});
</script>
</body></html>`;
}

export function ReportModal({ visible, onClose, city }: Props) {
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [selected, setSelected]       = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation]       = useState<LatLng | null>(null);
  const [locMode, setLocMode]         = useState<'gps' | 'map' | null>(null);
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [gpsError, setGpsError]       = useState('');
  const [mapError, setMapError]       = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');

  const { mutate: submit, isPending, isSuccess } = useSubmitReport();

  const pickerHTML = useMemo(
    () => buildPickerHTML({ lat: city.center.lat, lng: city.center.lng }, location?.lat, location?.lng),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [city.id, locMode],
  );

  function handleClose() {
    setStep(1); setSelected(null); setDescription('');
    setLocation(null); setLocMode(null); setGpsError('');
    onClose();
  }

  async function handleGPS() {
    setGpsLoading(true); setGpsError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setGpsError('Permissão negada. Ative a localização nas configurações.'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLocMode('gps');
    } catch {
      setGpsError('Não foi possível obter sua localização.');
    } finally {
      setGpsLoading(false);
    }
  }

  function handleMapMessage(e: WebViewMessageEvent) {
    try {
      const { lat, lng } = JSON.parse(e.nativeEvent.data) as LatLng;
      setLocation({ lat, lng });
      setLocMode('map');
    } catch { /* malformed */ }
  }

  function handleMapError() {
    setMapError(true);
  }

  async function handleSubmit() {
    if (!selected) return;
    const { allowed, remainingMs } = await canSubmitReport();
    if (!allowed) {
      setRateLimitMsg(`Aguarde ${formatCooldown(remainingMs)} antes de enviar outro reporte.`);
      return;
    }
    setRateLimitMsg('');
    const coords = location ?? { lat: city.center.lat, lng: city.center.lng };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submit(
      { type: selected, description, lat: coords.lat, lng: coords.lng, city: city.id },
      {
        onSuccess: () => {
          recordReportSubmission().catch(() => {});
          setTimeout(() => handleClose(), 1200);
        },
      },
    );
  }

  function openWaze() {
    if (!location) return;
    Linking.openURL(`waze://?ll=${location.lat},${location.lng}&navigate=no`).catch(() =>
      Linking.openURL(`https://waze.com/ul?ll=${location.lat},${location.lng}`)
    );
  }

  const stepTitle = ['Tipo', 'Localização', 'Detalhes'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
        }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>📢 Novo Reporte</Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
              Etapa {step} de 3 — {stepTitle[step - 1]}
            </Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Text style={{ fontSize: 18, color: '#94a3b8' }}>✕</Text>
          </Pressable>
        </View>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingTop: 12 }}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              backgroundColor: s <= step ? '#0077b6' : '#e2e8f0',
            }} />
          ))}
        </View>

        {/* ── ETAPA 1: tipo ───────────────────────────────────────────────── */}
        {step === 1 && (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              O que você quer reportar?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REPORT_TYPES.map(({ type, emoji, label }) => (
                <Pressable
                  key={type}
                  onPress={() => { setSelected(type); Haptics.selectionAsync(); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14,
                    backgroundColor: selected === type ? '#0077b6' : '#fff',
                    borderWidth: 1.5,
                    borderColor: selected === type ? '#0077b6' : 'rgba(0,0,0,0.08)',
                    boxShadow: selected === type ? '0 2px 8px rgba(0,119,182,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: selected === type ? '#fff' : '#374151' }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => { if (selected) setStep(2); }}
              disabled={!selected}
              style={{
                backgroundColor: selected ? '#0077b6' : '#94a3b8',
                borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8,
                boxShadow: selected ? '0 4px 16px rgba(0,119,182,0.3)' : undefined,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Próximo →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── ETAPA 2: localização ────────────────────────────────────────── */}
        {step === 2 && (
          <View style={{ flex: 1 }}>
            <View style={{ padding: 20, gap: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Onde aconteceu?
              </Text>

              {/* GPS button */}
              <TouchableOpacity
                onPress={handleGPS}
                disabled={gpsLoading}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: locMode === 'gps' ? '#dcfce7' : '#fff',
                  borderRadius: 14, padding: 14,
                  borderWidth: 1.5,
                  borderColor: locMode === 'gps' ? '#22c55e' : 'rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {gpsLoading
                  ? <ActivityIndicator size="small" color="#0077b6" />
                  : <Text style={{ fontSize: 20 }}>{locMode === 'gps' ? '✅' : '📡'}</Text>}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>
                    {locMode === 'gps' ? 'Usando minha localização' : 'Usar minha localização'}
                  </Text>
                  {locMode === 'gps' && location && (
                    <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </Text>
                  )}
                  {gpsError ? <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{gpsError}</Text> : null}
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>ou marque no mapa</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              </View>
            </View>

            {/* Leaflet picker */}
            <View style={{ flex: 1, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: locMode === 'map' ? '#0077b6' : '#e2e8f0' }}>
              {mapError ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f8fafc' }}>
                  <Text style={{ fontSize: 32 }}>🗺️</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>Mapa indisponível</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', paddingHorizontal: 24 }}>
                    Sem conexão com internet. Use o GPS ou pule esta etapa.
                  </Text>
                </View>
              ) : (
                <WebView
                  source={{ html: pickerHTML }}
                  onMessage={handleMapMessage}
                  onError={handleMapError}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={['*']}
                  mixedContentMode="always"
                  style={{ flex: 1 }}
                />
              )}
            </View>

            <View style={{ padding: 16, gap: 10 }}>
              {locMode === 'map' && location && (
                <Text style={{ fontSize: 12, color: '#0077b6', textAlign: 'center', fontWeight: '600' }}>
                  📍 Pin em {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </Text>
              )}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>← Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  style={{
                    flex: 2, backgroundColor: '#0077b6', borderRadius: 14, paddingVertical: 14, alignItems: 'center',
                    boxShadow: '0 4px 16px rgba(0,119,182,0.3)',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                    {location ? 'Próximo →' : 'Pular (centro da cidade)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── ETAPA 3: descrição + envio ──────────────────────────────────── */}
        {step === 3 && (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            {/* Resumo */}
            <View style={{
              backgroundColor: '#fff', borderRadius: 14, padding: 14,
              flexDirection: 'row', gap: 12, alignItems: 'center',
              borderWidth: 1, borderColor: '#e2e8f0',
            }}>
              <Text style={{ fontSize: 28 }}>
                {REPORT_TYPES.find(r => r.type === selected)?.emoji ?? '📍'}
              </Text>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b' }}>
                  {REPORT_TYPES.find(r => r.type === selected)?.label}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {location
                    ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : `🏙️ Centro de ${city.name}`}
                </Text>
              </View>
            </View>

            {/* Waze — só para acidente/blitz */}
            {location && WAZE_TYPES.includes(selected!) && (
              <TouchableOpacity
                onPress={openWaze}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: '#e8f5e3', borderRadius: 14, padding: 14,
                  borderWidth: 1.5, borderColor: '#33cc66',
                }}
              >
                <Text style={{ fontSize: 24 }}>🗺️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1a6e3c' }}>Abrir no Waze</Text>
                  <Text style={{ fontSize: 11, color: '#4ade80' }}>Ver a área no Waze para contexto</Text>
                </View>
                <Text style={{ fontSize: 18, color: '#33cc66' }}>›</Text>
              </TouchableOpacity>
            )}

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Descrição (opcional)
            </Text>
            <TextInput
              value={description}
              onChangeText={(t) => setDescription(t.slice(0, 280))}
              placeholder="Ex: Acidente na Rio-Santos, km 178..."
              maxLength={280}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#fff', borderRadius: 14, padding: 14,
                fontSize: 14, color: '#1e293b',
                borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
                minHeight: 80, textAlignVertical: 'top',
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setStep(2)}
                style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>← Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selected || isPending || isSuccess}
                style={{
                  flex: 2, backgroundColor: !selected || isPending || isSuccess ? '#94a3b8' : '#0077b6',
                  borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
                  boxShadow: selected && !isPending && !isSuccess ? '0 4px 16px rgba(0,119,182,0.3)' : undefined,
                }}
              >
                {isPending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                      {isSuccess ? '✅ Enviado!' : '📤 Enviar Reporte'}
                    </Text>}
              </TouchableOpacity>
            </View>
            {rateLimitMsg ? (
              <Text style={{ fontSize: 12, color: '#f59e0b', textAlign: 'center', marginTop: 4 }}>
                ⏳ {rateLimitMsg}
              </Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
