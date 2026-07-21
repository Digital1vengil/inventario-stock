/**
 * Inventario · Conteo y Stock — Backend multi-usuario (Google Drive)
 * ------------------------------------------------------------------
 * Varias personas pueden contar AL MISMO TIEMPO desde sus celulares.
 * Todos usan la MISMA URL de este script. Como el script corre en TU
 * cuenta, todo se guarda en TU Drive, dentro de la carpeta
 * "Inventario - Conteos":
 *
 *   - Un archivo por persona:  "Conteo - <nombre>"  (con su nombre en el
 *     nombre del archivo y en una columna). Cada uno sube al suyo, sin pisarse.
 *   - Un archivo "CONSOLIDADO Inventario" que junta TODO y en la hoja
 *     "Stock" muestra la SUMA por código de todas las personas.
 *
 * CÓMO PUBLICARLO (una sola vez, lo hace el dueño del Drive):
 *  1. https://script.google.com  ->  Nuevo proyecto.
 *  2. Borrá todo y pegá este archivo. Guardá.
 *  3. Implementar -> Nueva implementación -> Aplicación web
 *       - Ejecutar como:  Yo
 *       - Quién tiene acceso:  Cualquier usuario
 *  4. Autorizá con tu cuenta y copiá la URL /exec.
 *  5. Esa MISMA URL la pega cada persona en la app (Ajustes > URL del Apps Script).
 */

var FOLDER = 'Inventario - Conteos';
var MASTER = 'CONSOLIDADO Inventario';
var HDR = ['FechaHora','Persona','Sesion','Codigo','Articulo','Color','Talle','Rubro','Cantidad'];
var HDR_CAJAS = ['FechaHora','Persona','Sesion','Caja','Articulo','Rubro','Prendas'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // evita choques cuando varios suben a la vez
    var data = JSON.parse(e.postData.contents);
    var folder = getFolder_();

    if (data.test) {
      var m0 = getMaster_(folder);
      appendRows_(m0.getSheetByName('Detalle'), 'TEST', {sesion:'TEST', fecha:new Date(),
        items:[{codigo:'PRUEBA', articulo:'prueba de conexión', color:'', talle:'', rubro:'', cantidad:0}]});
      return json_({ok:true, msg:'test recibido en CONSOLIDADO'});
    }

    var persona = (data.responsable || 'SIN NOMBRE').toString().trim() || 'SIN NOMBRE';

    // 1) Archivo propio de la persona
    var personal = openOrCreateInFolder_(folder, 'Conteo - ' + persona);
    appendRows_(ensureSheet_(personal, 'Conteos', HDR), persona, data);
    appendCajas_(ensureSheet_(personal, 'Cajas', HDR_CAJAS), persona, data);

    // 2) Consolidado de todos
    var master = getMaster_(folder);
    appendRows_(master.getSheetByName('Detalle'), persona, data);
    appendCajas_(ensureSheet_(master, 'Cajas', HDR_CAJAS), persona, data);

    return json_({ok:true, persona:persona, guardados:(data.items || []).length, cajas:(data.cajas || []).length});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function doGet() {
  return json_({ok:true, msg:'Inventario backend multi-usuario activo. Usá POST para enviar conteos.'});
}

/* ---------- helpers ---------- */
function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}

function openOrCreateInFolder_(folder, name) {
  var it = folder.getFilesByName(name);
  if (it.hasNext()) return SpreadsheetApp.open(it.next());
  var ss = SpreadsheetApp.create(name);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  return ss;
}

function getMaster_(folder) {
  var ss = openOrCreateInFolder_(folder, MASTER);
  ensureSheet_(ss, 'Detalle', HDR);
  ensureStock_(ss);
  return ss;
}

function ensureSheet_(ss, name, header) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  // borra la hoja "Hoja 1"/"Sheet1" vacía por defecto
  var def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja1');
  if (def && def.getName() !== name && ss.getSheets().length > 1 && def.getLastRow() === 0) {
    try { ss.deleteSheet(def); } catch (e) {}
  }
  return sh;
}

/** Hoja "Stock": suma por código de TODO lo del consolidado (se autoactualiza). */
function ensureStock_(ss) {
  var sh = ss.getSheetByName('Stock');
  if (!sh) {
    sh = ss.insertSheet('Stock', 0);
    sh.getRange('A1').setFormula(
      '=QUERY(Detalle!D2:I, "select D, sum(I) where D is not null and D <> \'PRUEBA\' group by D order by D label D \'Codigo\', sum(I) \'Stock\'", 0)'
    );
    sh.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  return sh;
}

function appendRows_(sh, persona, data) {
  var fecha = data.fecha ? new Date(data.fecha) : new Date();
  var items = data.items || [];
  if (!items.length) return;
  var rows = items.map(function (it) {
    return [fecha, persona, data.sesion || '', it.codigo || '', it.articulo || '',
            it.color || '', it.talle || '', it.rubro || '', Number(it.cantidad) || 0];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HDR.length).setValues(rows);
}

function appendCajas_(sh, persona, data) {
  var fecha = data.fecha ? new Date(data.fecha) : new Date();
  var cajas = data.cajas || [];
  if (!cajas.length) return;
  var rows = cajas.map(function (c) {
    return [fecha, persona, data.sesion || '', c.caja || '', c.articulo || '', c.rubro || '', Number(c.prendas) || 0];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HDR_CAJAS.length).setValues(rows);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
