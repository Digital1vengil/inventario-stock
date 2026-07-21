# 📦 Sistema de Inventario y Stock

Sistema web para hacer **inventario, conteo y control de stock** sobre el catálogo de códigos de la empresa (3.437 códigos).

## Cómo funciona
- Buscás un código por **código o descripción** (con autocompletado).
- Cargás la **cantidad contada** → se guarda una **ficha** con código, cantidad, responsable y fecha/hora.
- El **stock de cada código se calcula sumando** todas sus fichas de conteo.
- Todo se guarda como **base de datos local en el navegador** (no se pierde al cerrar).
- Exportás a **Excel** (hoja *Stock* + hoja *Fichas*) para guardar la copia en tu Google Drive.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | La aplicación |
| `catalogo.js` | Catálogo de 3.437 códigos (código, descripción, rubro, subrubro, marca) |

## Uso online (GitHub Pages)
Activá GitHub Pages en *Settings → Pages → Branch: main / root*. La app queda en
`https://<usuario>.github.io/<repo>/`.

## Uso offline
Descargá `index.html` y `catalogo.js` en la misma carpeta y abrí `index.html`.
(El botón de Excel necesita conexión la primera vez para cargar la librería.)

## Funciones
- Búsqueda instantánea con teclado (↑ ↓ Enter).
- Stock consolidado con filtro por texto y por rubro.
- Historial de fichas con borrado individual.
- Exportar / importar Excel · Backup / restaurar (.json).

_Datos generados desde `Cambios_SKU_V2`._
