function procesarArchivo() {
    const input = document.getElementById('archivoExcel');
    const archivo = input.files[0];

    if (!archivo) {
        document.getElementById('mensaje').textContent = 'Por favor, selecciona un archivo Excel (.xlsx).';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Asumimos que queremos la primera hoja
        const nombreHoja = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[nombreHoja];

        // Convertir la hoja de cálculo a un arreglo de objetos JSON
        const datosJSON = XLSX.utils.sheet_to_json(worksheet);

        document.getElementById('mensaje').textContent = `Archivo "${archivo.name}" leído correctamente. Filas encontradas: ${datosJSON.length}.`;

        // ⚠️ Aquí es donde debes llamar a la función de almacenamiento externo
        guardarDatos(datosJSON, archivo.name);
    };

    reader.onerror = function(e) {
        document.getElementById('mensaje').textContent = 'Error al leer el archivo.';
        console.error(e);
    };

    reader.readAsArrayBuffer(archivo);
}