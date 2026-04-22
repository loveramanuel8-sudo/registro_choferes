// --- STATE ---
let records = [];
let currentPage = 1;
const recordsPerPage = 10;
const ADMIN_PASSWORD = "admin";

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    setLanguage('es'); // Default language
    
    document.getElementById('registro-form').addEventListener('submit', handleFormSubmit);
});

// --- CORE LOGIC ---
function loadRecords() {
    const saved = localStorage.getItem('portalChoferes_records');
    if (saved) {
        records = JSON.parse(saved);
        // Sort by newest first
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const now = new Date();
    
    const record = {
        id: Date.now(),
        nombre: formData.get('nombre'),
        rut: formData.get('rut'),
        celular: formData.get('celular'),
        patente_camion: formData.get('patente_camion').toUpperCase(),
        patente_chasis: formData.get('patente_chasis').toUpperCase(),
        sello_naviera: formData.get('sello_naviera').toUpperCase(),
        timestamp: now.toISOString()
    };

    records.unshift(record); // Add to beginning
    localStorage.setItem('portalChoferes_records', JSON.stringify(records));
    
    // Reset form
    e.target.reset();
    
    // Remove focus states
    document.querySelectorAll('input').forEach(input => input.blur());
    
    // Show success message
    Swal.fire({
        icon: 'success',
        title: translations[currentLang].msg_success_title,
        text: translations[currentLang].msg_success_text,
        background: '#FFFFFF',
        color: '#000000',
        confirmButtonColor: '#2563EB',
        timer: 3000,
        timerProgressBar: true
    });
}

// --- AUTHENTICATION ---
function promptAdminAccess() {
    Swal.fire({
        title: translations[currentLang].auth_title,
        input: 'password',
        inputPlaceholder: 'Contraseña...',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: translations[currentLang].auth_confirm,
        cancelButtonText: translations[currentLang].btn_back,
        background: '#FFFFFF',
        color: '#000000',
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#64748B',
        preConfirm: (password) => {
            if (password !== ADMIN_PASSWORD) {
                Swal.showValidationMessage(translations[currentLang].auth_error);
            }
            return password === ADMIN_PASSWORD;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            switchView('vista-historial');
        }
    });
}

// --- VIEW SWITCHING ---
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'vista-historial') {
        currentPage = 1;
        renderTable();
    }
}

// --- TABLE & PAGINATION ---
function renderTable() {
    const tbody = document.getElementById('historial-body');
    tbody.innerHTML = '';
    
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedItems = records.slice(start, end);
    
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay registros</td></tr>`;
    } else {
        paginatedItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(item.timestamp)}</td>
                <td>${item.nombre}</td>
                <td>${item.rut}</td>
                <td>${item.celular}</td>
                <td>${item.patente_camion}</td>
                <td>${item.patente_chasis}</td>
                <td>${item.sello_naviera || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    updatePaginationControls();
}

function formatDate(isoString) {
    const d = new Date(isoString);
    const locale = currentLang === 'es' ? 'es-CL' : 'pt-BR';
    return d.toLocaleString(locale, { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute:'2-digit', second:'2-digit'
    });
}

function updatePaginationControls() {
    const totalPages = Math.ceil(records.length / recordsPerPage) || 1;
    
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage === totalPages;
    
    updatePaginationText(totalPages);
}

function updatePaginationText(totalPages = null) {
    if(!totalPages) totalPages = Math.ceil(records.length / recordsPerPage) || 1;
    let text = translations[currentLang].page_of;
    text = text.replace('{0}', currentPage).replace('{1}', totalPages);
    document.getElementById('page-info').textContent = text;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(records.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// --- EXPORT TO EXCEL ---
function exportToExcel() {
    if (records.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'No hay datos para exportar',
            background: '#FFFFFF',
            color: '#000000'
        });
        return;
    }

    const dataForExcel = records.map(r => ({
        "Fecha y Hora": formatDate(r.timestamp),
        "Nombre": r.nombre,
        "RUT/Doc": r.rut,
        "Celular": r.celular,
        "Patente Camión": r.patente_camion,
        "Patente Chasis": r.patente_chasis,
        "Sello Naviera": r.sello_naviera || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
    
    // Auto-size columns roughly
    const wscols = [
        {wch: 20}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}
    ];
    worksheet['!cols'] = wscols;

    const dateStr = new Date().toISOString().slice(0,10);
    XLSX.writeFile(workbook, `Registro_Choferes_${dateStr}.xlsx`);
}
