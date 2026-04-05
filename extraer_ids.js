import fs from 'fs';

const extraerIds = () => {
    try {
        // 1. Leemos el archivo donde tenés tus productos fusionados
        const data = JSON.parse(fs.readFileSync('./src/data/para-filtrar-normal.json', 'utf8'));

        // 2. Mapeamos para obtener solo el array de strings con los IDs
        const listaIds = data.map(card => card.id);

        // 3. Lo mostramos en la terminal para que lo puedas copiar
        console.log("🚀 Lista de IDs extraída:");
        console.log(listaIds);

        // Opcional: Si querés guardarlos en un archivo aparte
        fs.writeFileSync('./src/data/solo_ids.json', JSON.stringify(listaIds, null, 2));
        console.log(`\n✅ Se guardaron ${listaIds.length} IDs en src/data/solo_ids.json`);

    } catch (error) {
        console.error("❌ Error al procesar el archivo:", error.message);
    }
};

extraerIds();