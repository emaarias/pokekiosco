import fs from 'fs';

const mapSets = {
    "PAF": "sv4pt5", "MEG": "me1", "PFL": "me2", "JTG": "sv9",
    "ASC": "me2pt5", "SSP": "sv8", "SCR": "sv7", "PAR": "sv4",
    "TWM": "sv6", "OBF": "sv3", "PAL": "sv2", "DRI": "sv10",
    "TEF": "sv5", "SVI": "sv1", "F": "swsh12"
};

// Traductor de tipos para que mantengas la estética en español
const traducirTipo = (tipos) => {
    if (!tipos || tipos.length === 0) return "Normal";
    const diccionario = {
        "Grass": "Planta",
        "Fire": "Fuego",
        "Water": "Agua",
        "Lightning": "Eléctrico",
        "Psychic": "Psíquico",
        "Fighting": "Lucha",
        "Darkness": "Siniestro",
        "Metal": "Acero",
        "Dragon": "Dragón",
        "Colorless": "Normal"
    };
    return diccionario[tipos[0]] || tipos[0];
};

const mergePorNumero = () => {
    console.log("🚀 Iniciando fusión inteligente por NÚMERO...");

    // 1. Carga de archivos
    const productosNuevos = JSON.parse(fs.readFileSync('./src/data/productos_por_numero.json', 'utf8'));
    const masterDB = JSON.parse(fs.readFileSync('./src/data/me_all.json', 'utf8'));
    
    let stockExistente = [];
    try {
        stockExistente = JSON.parse(fs.readFileSync('./src/data/stock_final.json', 'utf8'));
    } catch (e) {
        console.log("⚠️ No se encontró stock_final.json, iniciando base nueva.");
    }

    const nuevosProcesados = productosNuevos.map(p => {
        const setID = mapSets[p.Expansión] || p.Expansión.toLowerCase();
        
        // Buscamos el match por número e ID de set
        const match = masterDB.find(m => 
            m.number.toString() === p.Numero.toString() && 
            m.id.startsWith(setID)
        );

        if (match) {
            console.log(`✅ Detectado: #${p.Numero} -> ${match.name} [${traducirTipo(match.types)}]`);
            return {
                ...p,
                Nombre: match.name,              // Sacado de la DB
                Tipo: traducirTipo(match.types), // Sacado y traducido de la DB
                id: match.id,
                images: match.images,
                flavorText: match.flavorText || "Sin descripción disponible.",
                rarity: match.rarity || "Common",
                number: match.number
            };
        } else {
            console.log(`❌ Error: No existe la carta #${p.Numero} en el set ${p.Expansión}`);
            return null; // No la agregamos si no existe en la DB
        }
    }).filter(p => p !== null); // Limpiamos los que fallaron

    // UNIFICACIÓN Y PREVALENCIA
    // Si la carta ya existía, la versión de "productos_por_numero" pisa a la anterior
    const idsNuevos = new Set(nuevosProcesados.map(n => n.id));
    const stockFiltrado = stockExistente.filter(item => !idsNuevos.has(item.id));

    const stockFinalTotal = [...stockFiltrado, ...nuevosProcesados];

    fs.writeFileSync('./src/data/stock_final.json', JSON.stringify(stockFinalTotal, null, 2));
    
    console.log(`\n✨ ¡Fusión Exitosa!`);
    console.log(`📦 Procesadas: ${nuevosProcesados.length} cartas.`);
    console.log(`🗃️  Stock Total Actual: ${stockFinalTotal.length} cartas.`);
};

mergePorNumero();