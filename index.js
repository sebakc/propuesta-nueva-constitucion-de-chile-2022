const fs = require('fs');
const MINIFY = false;
const files = [
  '01 - Principios y Disposiciones Generales.md',
  '02 - Derechos Fundamentales y Garantías.md',
  '03 - Naturaleza y Medioambiente.md',
  '04 - Participación Democrática.md',
  '05 - Buen Gobierno y Función Pública.md',
  '06 - Estado Regional y Organización Territorial.md',
  '07 - Poder Legislativo.md',
  '08 - Poder Ejecutivo.md',
  '09 - Sistemas de Justicia.md',
  '10 - Órganos Autónomos Constitucionales.md',
  '11 - Reforma y Reemplazo de la Constitución.md',
]

for (let index = 0; index < files.length; index++) {
  const element = files[index];
  
  // Leer el contenido del archivo input.txt
  const input = fs.readFileSync(`docs/TextoNuevaConstitucionChilena/Markdown/${element}`, 'utf8');
  
  // Separa el contenido del archivo en líneas
  let lines = input.trim().split('\n');
  // remove all the empty lines
  lines = lines.filter(line => line.trim() !== '')
  // Inicializa el objeto que representará el JSON de salida
  const output = { capitulo: '', nombre: '', articulos: {} };
  let currentArticle = '';
  let inciso = ''
  let prev = ''
  let prevArticle, category
  
  // Recorre todas las líneas del archivo
  for (const line of lines) {
    if (line.startsWith('## ')) {
      category = line.replace('## ', '')
    } else if (line.startsWith('# Capítulo')) {
      // Si la línea comienza con "# Capítulo", se extrae el número de capítulo y el nombre
      const match = /^# Capítulo ([IVXLCM]+): (.+)$/.exec(line);
      if (match) {
        output.capitulo = match[1];
        output.nombre = match[2];
      }
    } else if (line.startsWith('### Artículo')) {
      versiculo = 1
      // Si la línea comienza con "### Artículo", se extrae el número de artículo
      const match = /^### Artículo (\d+)$/.exec(line);
      if (match) {
        currentArticle = match[1];
        output.articulos[currentArticle] = {
          versiculos: {}
        };
      }
    } else if (currentArticle !== '' && /^(?!(\s+-\s+[a-z]\)).*)/.exec(line) && (prev.startsWith('### Artículo') || /^\d+\.\s/.exec(line)))  {
      if (prevArticle?.incisos && !Object.keys(prevArticle?.incisos).length) {
        delete prevArticle.incisos
      }
      if (category)
        output.articulos[currentArticle].categoria = category
      // Si no se está en un encabezado de capítulo o artículo, y se está en un artículo actual,
      // se agrega el contenido de la línea al array correspondiente del JSON de salida
      output.articulos[currentArticle].versiculos[versiculo] = {
        contenido: line.trim().replace(/^\d+\.\s/, ''),
        incisos: {}
      }
      prevArticle = output.articulos[currentArticle].versiculos[versiculo]
      versiculo++
    } else if (/^(\s*-?\s+[a-z]\)).*/i.exec(line)) {
      versiculo--
      try {
        inciso = /^((\s+-\s+[a-z]\)).*)/.exec(line)[2].trim().replace('- ', '').replace(')', '')
      } catch (error) {
        inciso = /^((-\s+[a-z]\)).*)/.exec(line)[2].trim().replace('- ', '').replace(')', '')
      }
      output.articulos[currentArticle].versiculos[versiculo].incisos[inciso] = line.trim().replace(/^((-\s+[a-z]\)))/, '').replace(' ', '')
      versiculo++
    } else if (inciso !== '') {
      versiculo--
      output.articulos[currentArticle].versiculos[versiculo].incisos[inciso] += '\n' + line.trim().replace(/^((\s+-\s+[a-z]\)).*)/, '')
      versiculo++
    }
    prev = line
  }
  if (prevArticle?.incisos && !Object.keys(prevArticle?.incisos).length) {
    delete prevArticle.incisos
  }

  const jsonName = element.replace('.md', '');
  
  // Escribir el objeto JSON en el archivo output.json
  fs.writeFileSync(`outputs/${jsonName}.json`, JSON.stringify(output, null, MINIFY ? 0 : 2));
}