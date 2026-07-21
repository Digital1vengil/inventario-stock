# 📦 Inventario · Conteo y Stock

App web **mobile-first** para hacer inventario por **artículo → color → talle**, con base de datos local y **carga automática a Google Drive**. Catálogo de 258 artículos (3.437 SKUs) tomado de la planilla de códigos.

**App en vivo:** https://digital1vengil.github.io/inventario-stock/

## Cómo se usa
1. Escribí tu nombre en "¿Quién cuenta?".
2. En **Contar**, buscás el artículo (o filtrás por rubro) y lo tocás.
3. Se abre la ventana con **todos los colores y talles**: cargás las cantidades contadas.
4. **Aceptar** → el artículo queda en el conteo actual (podés seguir con más artículos).
5. **Finalizar** → **vista previa** de todo lo contado.
6. **Confirmar y subir** → se guarda en el historial y se sube solo a tu Google Drive.

El stock de cada código se calcula **sumando** los conteos confirmados. En **Resumen** ves el stock consolidado y podés exportar a Excel o hacer backup.

## Conexión con Google Drive (una vez)
1. Abrí https://script.google.com → **Nuevo proyecto**.
2. Pegá el contenido de [`APPS_SCRIPT.gs`](APPS_SCRIPT.gs).
3. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
4. Autorizá con tu cuenta y copiá la **URL `/exec`**.
5. En la app: **Ajustes → URL del Apps Script**, pegala y **Guardar**. Probá con "Probar conexión".

Se crea sola una planilla llamada **"Inventario - Conteos"** en tu Drive, que podés abrir o exportar como Excel.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La aplicación (mobile-first) |
| `articulos.js` | Catálogo agrupado por artículo, color y talle |
| `APPS_SCRIPT.gs` | Backend de Google que guarda los conteos en tu Drive |

## Notas
- Optimizada para celular (también funciona en PC). Los datos se guardan en el dispositivo hasta confirmarlos.
- El botón de Excel y la subida a Drive necesitan conexión.
