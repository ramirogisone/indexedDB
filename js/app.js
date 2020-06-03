let DB;

const formulario = document.querySelector('form'), 
	  mascota = document.getElementById('mascota'),
	  cliente = document.getElementById('cliente'),
	  telefono = document.getElementById('telefono'),
	  fecha = document.getElementById('fecha'),
	  hora = document.getElementById('hora'),
	  sintomas = document.getElementById('sintomas'),
	  headAdministra = document.getElementById('administra'),
	  citas = document.getElementById('citas');


document.addEventListener('DOMContentLoaded', () => {
	let createDB = window.indexedDB.open('citas', 1);
	createDB.onerror = () => {
		// console.log('Error');
	}
	createDB.onsuccess = () => {
		// console.log('Correcto');
		DB = createDB.result;
		mostraCitas();
	}
	
	//Usamos el siguiente metodo para la creacion del esquema, este metodo se ejecuta solo una vez
	createDB.onupgradeneeded = (ev) => {
		let db = ev.target.result;
		//El OS toma 2 params, el 1 es el nombre de la db, el 2 las opciones. KeyPath es el indice de la DB
		let objectStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true});
		//creamos los indices y campos, 1: nombre del campo, 2: keypath, 3: opciones
		objectStore.createIndex('mascota', 'mascota', { unique : false });
		objectStore.createIndex('cliente', 'cliente', { unique : false });
		objectStore.createIndex('telefono', 'telefono', { unique : false });
		objectStore.createIndex('fecha', 'fecha', { unique : false });
		objectStore.createIndex('hora', 'hora', { unique : false });
		objectStore.createIndex('sintomas', 'sintomas', { unique : false });
	}
	formulario.addEventListener('submit', agregarDatosDB);

	function agregarDatosDB(ev){
		ev.preventDefault();
		const nuevaCita = {
			mascota: mascota.value,
			cliente: cliente.value,
			telefono: telefono.value,
			fecha: fecha.value,
			hora: hora.value,
			sintomas: sintomas.value, 
		}
		//utilizamos transacciones para insertar en la db
		let transaction = DB.transaction(['citas'], 'readwrite');
		let objectStore = transaction.objectStore('citas');
		let peticion = objectStore.add(nuevaCita);
		//en caso que el registro se inserte correctamente, limpio el formulario
		peticion.onsuccess = () => {
			formulario.reset();
		}
		transaction.oncomplete = () => {
			console.log('Registro agregado');
			mostraCitas();
		}
		transaction.onerror = () => {
			console.log('Hubo un error');
		}
	}
	function mostraCitas(){
		while(citas.firstChild){
			citas.removeChild(citas.firstChild);
		}
		// creamos objectstore
		let objectStore = DB.transaction('citas').objectStore('citas');
		// se retorna una peticion
		objectStore.openCursor().onsuccess = (ev) => {
			// cursor se va a ubicar en el registro indicado para acceder a los datos
			let cursor = ev.target.result;
			if(cursor){
				let citaHTML = document.createElement('li');
				citaHTML.setAttribute('data-cita-id', cursor.value.key);
				citaHTML.classList.add('list-group-item');
				citaHTML.innerHTML = `
					<p class='font-weight-bold'>Mascota: <span class='font-weight-normal'>${cursor.value.mascota}</span></p>
					<p class='font-weight-bold'>Cliente: <span class='font-weight-normal'>${cursor.value.cliente}</span></p>
					<p class='font-weight-bold'>Teléfono: <span class='font-weight-normal'>${cursor.value.telefono}</span></p>
					<p class='font-weight-bold'>Fecha: <span class='font-weight-normal'>${cursor.value.fecha}</span></p>
					<p class='font-weight-bold'>Hora: <span class='font-weight-normal'>${cursor.value.hora}</span></p>
					<p class='font-weight-bold'>Síntomas: <span class='font-weight-normal'>${cursor.value.sintomas}</span></p>
				`;
				const botonBorrar = document.createElement('button');
				botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
				botonBorrar.innerHTML = '<span aria-hidden="true">X</span> Borrar';
				botonBorrar.onclick = borrarCita;
				citaHTML.appendChild(botonBorrar);
				citas.appendChild(citaHTML);
				cursor.continue();
			}else{
				if(!citas.firstChild){
					//si no hay registros
					headAdministra.textContent = 'Agregar citas para comenzar';
					let listado = document.createElement('p');
					listado.classList.add('text-center');
					listado.textContent = 'No hay registros';
					citas.appendChild(listado);
				}else{
					headAdministra.textContent = 'Administra las citas';
				}
			}
		}
	}
	function borrarCita(ev){
		let citaId = Number(ev.target.parentElement.getAttribute('data-cita-id'));
		let transaction = DB.transaction(['citas'], 'readwrite');
		let objectStore = transaction.objectStore('citas');
		let peticion = objectStore.delete(citaId);
		transaction.oncomplete = () => {
			ev.target.parentElement.parentElement.removeChild(ev.target.parentElement);

			if(!citas.firstChild){
				//si no hay registros
				headAdministra.textContent = 'Agregar citas para comenzar';
				let listado = document.createElement('p');
				listado.classList.add('text-center');
				listado.textContent = 'No hay registros';
				citas.appendChild(listado);
			}else{
				headAdministra.textContent = 'Administra las citas';
			}
		}

	}
})