export function fechaConfetti(desplazamiento = 0, ahora = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(ahora);
  const valor = (t) => parts.find(p => p.type === t).value;
  const fecha = new Date(Date.UTC(Number(valor('year')), Number(valor('month')) - 1, Number(valor('day')) + desplazamiento));
  return fecha.toISOString().slice(0, 10);
}
