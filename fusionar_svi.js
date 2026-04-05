import fs from 'fs';

const mapSets = {
    "PAF": "sv4pt5", "MEG": "me1", "PFL": "me2", "JTG": "sv9",
    "ASC": "me2pt5", "SSP": "sv8", "SCR": "sv7", "PAR": "sv4",
    "TWM": "sv6", "OBF": "sv3", "PAL": "sv2", "DRI": "sv10",
    "TEF": "sv5", "SVI": "sv1", "F": "swsh12"
};

const traducirTipo = (tipos) => {
    if (!tipos || tipos.length === 0) return "Normal";
    const diccionario = {
        "Grass": "Planta", "Fire": "Fuego", "Water": "Agua",
        "Lightning": "Eléctrico", "Psychic": "Psíquico", "Fighting": "Lucha",
        "Darkness": "Siniestro", "Metal": "Acero", "Dragon": "Dragón",
        "Colorless": "Normal"
    };
    return diccionario[tipos[0]] || tipos[0];
};

const mergePorNumero = () => {
    console.log("🚀 Iniciando fusión inteligente (Precisión SVI)...");

    // 1. Carga de archivos con blindaje para objeto único o array
    const rawData = JSON.parse(fs.readFileSync('./src/data/productos_por_numero.json', 'utf8'));
    const productosNuevos = Array.isArray(rawData) ? rawData : [rawData];
    
    const masterDB = JSON.parse(fs.readFileSync('./src/data/me_all.json', 'utf8'));
    
    let stockExistente = [];
    try {
        stockExistente = JSON.parse(fs.readFileSync('./src/data/stock_final.json', 'utf8'));
    } catch (e) {
        console.log("⚠️ No se encontró stock_final.json previo.");
    }

    const nuevosProcesados = productosNuevos.map(p => {
        const setIDBuscado = mapSets[p.Expansión] || p.Expansión.toLowerCase();
        
        // BUSQUEDA MEJORADA: 
        // En lugar de startsWith, separamos el ID por el guión para comparar el SET exacto.
        // Ejemplo: si buscamos 'sv1', no va a matchear con 'sv10-1' porque 'sv1' !== 'sv10'
        const match = masterDB.find(m => {
            const setIDEnDB = m.id.split('-')[0]; // Extrae 'sv1' de 'sv1-25'
            return m.number.toString() === p.Numero.toString() && setIDEnDB === setIDBuscado;
        });

        if (match) {
            console.log(`✅ [${p.Expansión}] #${p.Numero} -> ${match.name}`);
            return {
                ...p,
                Nombre: match.name,
                Tipo: traducirTipo(match.types),
                id: match.id,
                images: match.images,
                flavorText: match.flavorText || "Sin descripción.",
                rarity: match.rarity || "Common",
                number: match.number
            };
        } else {
            console.log(`❌ Error: No existe la carta #${p.Numero} en el set ${p.Expansión} (${setIDBuscado})`);
            return null;
        }
    }).filter(p => p !== null);

    // UNIFICACIÓN (Pisa lo viejo con lo nuevo si coincide el ID)
    const idsNuevos = new Set(nuevosProcesados.map(n => n.id));
    const stockFiltrado = stockExistente.filter(item => !idsNuevos.has(item.id));
    const stockFinalTotal = [...stockFiltrado, ...nuevosProcesados];

    fs.writeFileSync('./src/data/stock_final.json', JSON.stringify(stockFinalTotal, null, 2));
    
    console.log(`\n✨ Proceso terminado. Total en stock: ${stockFinalTotal.length}`);
};

mergePorNumero();