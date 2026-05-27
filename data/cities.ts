export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { id: 'caraguatatuba', name: 'Caraguatatuba', lat: -23.6201, lng: -45.4129 },
  { id: 'sao-sebastiao', name: 'São Sebastião', lat: -23.7957, lng: -45.4082 },
  { id: 'ubatuba', name: 'Ubatuba', lat: -23.4336, lng: -45.0838 },
  { id: 'ilhabela', name: 'Ilhabela', lat: -23.7786, lng: -45.3582 },
];

export const DEFAULT_CITY: City = CITIES[0];
