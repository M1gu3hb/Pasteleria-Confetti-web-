# CLAUDE.md — Reglas permanentes (Web Confetti — catálogo público)

> Repo SEPARADO del POS. La Web es un **frontend aparte** que comparte la MISMA base Supabase del POS.

## ANTES DE TOCAR NADA
1. Lee **`PROJECT_CONTEXT.md`** (raíz) COMPLETO.
2. Lee **`docs/`**: WEB0_RECON (comprensión + inventario + gaps), NEXT_STEPS.
3. Revisa el estado real de la DB compartida con las herramientas de Supabase (proyecto `ivqcxdpqxwjxfohiswqb`): vistas `catalogo_publico`/`config_publica`, RLS anon.

## Arquitectura — Opción A (DB compartida + RLS), ya decidida
La Web **no tiene base propia**. Se conecta al **MISMO Supabase del POS** con la **anon key** + RLS:
- **Lee** catálogo (`catalogo_publico`), config (`config_publica`), sucursales/categorías (RLS anon).
- **Inserta** pedidos tentativos en `pedidos` (`origen='web'`, `estado='pendiente'`).
- **CERO** acceso a ventas/cortes/usuarios/costos (RLS lo deniega; adversarial verificado en el POS).
- **El puente Base44 DESAPARECE**: nada de `crearPedidoPOS`/`entry.ts`, `posApiClient.js`, `producto_pos_id`, `folio_pedido`, `sucursales_disponibles` (nombres), ni `api_key`.

## Reglas de seguridad / alcance
- **NUNCA** re-exponer la api_key `847df…` (en el baseline está REDACTADA; Miguel la rota). El puente muere.
- **NUNCA** tocar la app Base44 viva ni datos reales (solo LECTURA por MCP para verificar).
- **NO tocar** el repo ni el código del POS (`Pasteleria-Confetti`), salvo LEER el esquema/vistas compartidas.
- La Web **nunca** expone datos internos del POS. Lo garantiza la RLS, no solo la UI.
- snake_case en DB. Anon key es pública por diseño (va en el bundle); la seguridad la da la RLS.

## Proceso por fases (igual que el POS)
WEB-0 (recon+andamiaje) → WEB-1 (resolver gaps + port capa de datos) → … Al terminar cada fase
**DETENERSE y reportar**; esperar luz verde de Miguel. No encadenar fases.

## Documentación viva (OBLIGATORIO)
Tras CADA cambio significativo, actualiza la doc + `docs/`. Commit + push frecuente (conventional commits, sin co-author de IA).

## Git
Rama de trabajo: `migracion/supabase` (no `main`). `main` = baseline export Base44 de la web (api_key REDACTADA).
