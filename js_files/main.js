
// Your firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAlUvuJ4CAYddsR-fCbqvbMPBkpBz0Lx50",
  authDomain: "academiatic101.firebaseapp.com",
  projectId: "academiatic101",
  storageBucket: "academiatic101.appspot.com",
  messagingSenderId: "151828534704",
  appId: "1:151828534704:web:3f4cba9439bcf2d68df275",
  measurementId: "G-B3602ZRF41"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

        const nombreHoja = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[nombreHoja];

        const datosJSON = XLSX.utils.sheet_to_json(worksheet);

        document.getElementById('mensaje').textContent = `Archivo \"${archivo.name}\" leído correctamente. Filas encontradas: ${datosJSON.length}.`;

        guardarDatos(datosJSON, archivo.name);
    };

    reader.onerror = function(e) {
        document.getElementById('mensaje').textContent = 'Error al leer el archivo.';
        console.error(e);
    };

    reader.readAsArrayBuffer(archivo);
}

function guardarDatos(datos, nombreArchivo) {
  db.collection("excelData").doc(nombreArchivo).set({
    data: datos,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
      console.log("Document successfully written!");
      document.getElementById('mensaje').textContent = `Datos del archivo \"${nombreArchivo}\" guardados en Firebase.`;
      // Refresh data on screen
      cargarYMostrarDatos();
  })
  .catch((error) => {
      console.error("Error writing document: ", error);
      document.getElementById('mensaje').textContent = 'Error al guardar los datos en Firebase.';
  });
}

function cargarYMostrarDatos() {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Limpiar el contenedor

    db.collection("excelData").orderBy("timestamp", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const fileData = doc.data();
            const fileName = doc.id;
            const data = fileData.data;

            // Crear un título para el archivo
            const fileTitle = document.createElement('h3');
            fileTitle.textContent = fileName;
            container.appendChild(fileTitle);

            // Crear una tabla para los datos
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            const headerRow = document.createElement('tr');

            // Crear cabeceras de la tabla
            if(data.length > 0) {
                Object.keys(data[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
            }

            // Crear filas de datos
            data.forEach(rowData => {
                const row = document.createElement('tr');
                Object.values(rowData).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            container.appendChild(table);
        });
    });
}

// Cargar los datos cuando la página se carga por primera vez
document.addEventListener('DOMContentLoaded', (event) => {
    cargarYMostrarDatos();
});
