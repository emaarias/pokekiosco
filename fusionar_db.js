import fs from 'fs';

const mapSets = {
    "PAF": "sv4pt5", "MEG": "me1", "PFL": "me2", "JTG": "sv9",
    "ASC": "me2pt5", "SSP": "sv8", "SCR": "sv7", "PAR": "sv4",
    "TWM": "sv6", "OBF": "sv3", "PAL": "sv2", "DRI": "sv10",
    "TEF": "sv5", "SVI": "sv1", "F": "swsh12"
};

// Diccionario de corrección automática para tus errores del Excel
const correcciones = {
    "Vivilon": "Vivillon",
    "Carmeleon": "Charmeleon",
    "Orgerpon": "Ogerpon",
    "Wugtirio": "Wugtrio",
    "Houdstone": "Houndstone",
    "Sinitscha": "Sinistcha",
    "Porygon 2": "Porygon2",
    "Rotom-Fan": "Rotom",
    "Tarountula": "Tarountula" // A veces el set ASC no tiene a Tarountula, buscamos en general
};

const merge = () => {
    const productos = JSON.parse(fs.readFileSync('./src/data/productos.json', 'utf8'));
    const masterDB = JSON.parse(fs.readFileSync('./src/data/me_all.json', 'utf8'));

    const stockFinal = productos.map(p => {
        // 1. Corregimos el nombre si está en nuestro diccionario
        let nombreCorregido = correcciones[p.Nombre] || p.Nombre;
        const setID = mapSets[p.Expansión] || p.Expansión.toLowerCase();
        
        // 2. Intentamos match estricto (Nombre + Set)
        let match = masterDB.find(m => 
            m.name.toLowerCase() === nombreCorregido.toLowerCase() &&
            m.id.startsWith(setID)
        );

        // 3. Si no hay match, intentamos búsqueda SOLO por nombre (Fuzzy match)
        if (!match) {
            match = masterDB.find(m => m.name.toLowerCase() === nombreCorregido.toLowerCase());
        }

        if (match) {
            return {
                ...p,
                nombre: p.Nombre, // Mantenemos tu nombre del excel
                id: match.id,
                images: match.images,
                flavorText: match.flavorText || "Sin descripción.",
                rarity: match.rarity,
                types: match.types,
                number: match.number
            };
        } else {
            return {
                ...p,
                nombre: p.Nombre,
                images: { small: 'https://images.pokemontcg.io/generic/card.png' },
                id: `manual-${p.Nombre}-${p.Expansión}`
            };
        }
    });

    fs.writeFileSync('./src/data/stock_final.json', JSON.stringify(stockFinal, null, 2));
    console.log(`✅ Fusión terminada. Revisá stock_final.json`);
};

merge();