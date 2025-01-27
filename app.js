class HorasRegistro {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.initEventListeners();
        this.renderTabla();
    }

    initEventListeners() {
        document.getElementById('hoursForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarHoras();
        });

        document.getElementById('searchButton').addEventListener('click', () => {
            this.buscarPorNombre();
        });
    }

    registrarHoras() {
        const nombre = document.getElementById('nombreInput').value;
        const rango = document.getElementById('rangoInput').value;
        const fecha = document.getElementById('fechaInput').value;
        const horaEntrada = document.getElementById('horaEntradaInput').value;
        const horaSalida = document.getElementById('horaSalidaInput').value;

        const horasTrabajadas = this.calcularHorasTrabajadas(horaEntrada, horaSalida);
        
        const registro = {
            nombre,
            rango,
            fecha,
            horaEntrada,
            horaSalida,
            horasTrabajadas
        };

        this.registros.push(registro);
        this.guardarRegistros();
        this.renderTabla();
        this.verificarHorasMinimas(registro);
    }

    calcularHorasTrabajadas(horaEntrada, horaSalida) {
        const entrada = new Date(`2023-01-01T${horaEntrada}`);
        const salida = new Date(`2023-01-01T${horaSalida}`);
        const diferencia = salida - entrada;
        const horas = diferencia / (1000 * 60 * 60);
        return horas.toFixed(2);
    }

    verificarHorasMinimas(registro) {
        if (parseFloat(registro.horasTrabajadas) < 3) {
            this.mostrarNotificacion(`${registro.nombre} no cumplió con las 3 horas mínimas`);
        }
    }

    mostrarNotificacion(mensaje) {
        const notificationContainer = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = mensaje;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    renderTabla() {
        const tableBody = document.getElementById('horasTableBody');
        tableBody.innerHTML = '';

        const registrosPorSemana = this.agruparRegistrosPorSemana();

        registrosPorSemana.forEach(semana => {
            semana.registros.forEach(registro => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${registro.nombre}</td>
                    <td>${registro.rango}</td>
                    <td>${registro.fecha}</td>
                    <td>${registro.horaEntrada}</td>
                    <td>${registro.horaSalida}</td>
                    <td>${registro.horasTrabajadas}</td>
                `;

                if (semana.totalHoras < 28) {
                    row.classList.add('hours-below-minimum');
                } else {
                    row.classList.add('hours-above-minimum');
                }

                tableBody.appendChild(row);
            });
        });
    }

    agruparRegistrosPorSemana() {
        const semanas = {};

        this.registros.forEach(registro => {
            const fecha = new Date(registro.fecha);
            const semanaKey = this.obtenerSemanaKey(fecha);

            if (!semanas[semanaKey]) {
                semanas[semanaKey] = {
                    registros: [],
                    totalHoras: 0
                };
            }

            semanas[semanaKey].registros.push(registro);
            semanas[semanaKey].totalHoras += parseFloat(registro.horasTrabajadas);
        });

        return Object.values(semanas);
    }

    obtenerSemanaKey(fecha) {
        const year = fecha.getFullYear();
        const week = this.getWeekNumber(fecha);
        return `${year}-W${week}`;
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    buscarPorNombre() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const tableBody = document.getElementById('horasTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        for (let row of rows) {
            const nombreCell = row.getElementsByTagName('td')[0];
            if (nombreCell) {
                const nombre = nombreCell.textContent.toLowerCase();
                row.style.display = nombre.includes(searchTerm) ? '' : 'none';
            }
        }
    }

    guardarRegistros() {
        localStorage.setItem('registros', JSON.stringify(this.registros));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HorasRegistro();
});