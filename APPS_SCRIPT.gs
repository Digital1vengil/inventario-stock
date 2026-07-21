/**
 * Inventario · Conteo y Stock — Backend para Google Drive
 * ------------------------------------------------------------
 * Este script recibe los conteos que envía la app web y los guarda
 * automáticamente en una planilla de Google Sheets en TU Drive
 * (que podés abrir/exportar como Excel).
 *
 * CÓMO PUBLICARLO (una sola vez):
 *  1. Entrá a https://script.google.com  ->  "Nuevo proyecto".
 *  2. Borrá el contenido y pegá TODO este archivo.
 *  3. Guardá (icono de diskette).
 *  4. Implementar  ->  Nueva implementación  ->  tipo "Aplicación web".
 *       - Ejecutar como:  Yo (tu cuenta)
 *       - Quién tiene acceso:  Cualquier usuario
 *  5. "Implementar", autorizá los permisos con tu cuenta.
 *  6. Copiá la URL que termina en /exec  y pegala en la app (Ajustes > URL del Apps Script).
 *
 * La planilla se crea sola la primera vez con el nombre de abajo.
 */

var NOMBRE_PLANILLA = 'Inventario - Conteos';   // se crea en tu Drive si no existe
var HOJA = 'Conteos';
var ENCABEZADOS = ['FechaHora','Sesion','Responsable','Codigo','Articulo','Color','Talle','Rubro','Cantidad'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sh = getHoja_();

    // Fila de prueba (botón "Probar conexión" en la app)
    if (data.test) {
      sh.appendRow([new Date(), 'TEST', 'prueba de conexión', '', '', '', '', '', '']);
      return json_({ok:true, msg:'test recibido'});
    }

    var fecha = data.fecha ? new Date(data.fecha) : new Date();
    var items = data.items || [];
    items.forEach(function(it){
      sh.appendRow([
        fecha,
        data.sesion || '',
        data.responsable || '',
        it.codigo || '',
        it.articulo || '',
        it.color || '',
        it.talle || '',
        it.rubro || '',
        Number(it.cantidad) || 0
      ]);
    });
    return json_({ok:true, guardados:items.length});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function doGet() {
  return json_({ok:true, msg:'Inventario backend activo. Usá POST para enviar conteos.'});
}

/** Busca (o crea) la planilla y devuelve la hoja de conteos con encabezados. */
function getHoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    var files = DriveApp.getFilesByName(NOMBRE_PLANILLA);
    ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(NOMBRE_PLANILLA);
    props.setProperty('SHEET_ID', ss.getId());
  }
  var sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (sh.getLastRow() === 0) {
    sh.appendRow(ENCABEZADOS);
    sh.getRange(1,1,1,ENCABEZADOS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
