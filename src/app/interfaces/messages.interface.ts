export interface Messages  {
  userDisplayName?: string; // Nombre a mostrar del usuario
  text: string,
  from: string, //uid del usuario
  ts: number, //timestamp mostrar la hora
  avatar?: string; // URL del avatar del usuario
}
