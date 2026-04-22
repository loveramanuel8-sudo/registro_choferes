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
        numero_contenedor: formData.get('numero_contenedor').toUpperCase(),
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
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No hay registros</td></tr>`;
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
                <td>${item.numero_contenedor || '-'}</td>
                <td>${item.sello_naviera || '-'}</td>
                <td class="actions-cell">
                    <button onclick="editRecord(${item.id})" class="btn-icon btn-edit" title="${translations[currentLang].btn_edit}"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteRecord(${item.id})" class="btn-icon btn-delete" title="${translations[currentLang].btn_delete}"><i class="fa-solid fa-trash"></i></button>
                </td>
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

// --- ACTIONS ---
function deleteRecord(id) {
    Swal.fire({
        title: translations[currentLang].msg_delete_title,
        text: translations[currentLang].msg_delete_text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#64748B',
        confirmButtonText: translations[currentLang].btn_delete,
        cancelButtonText: translations[currentLang].btn_cancel,
        background: '#FFFFFF',
        color: '#000000'
    }).then((result) => {
        if (result.isConfirmed) {
            records = records.filter(r => r.id !== id);
            localStorage.setItem('portalChoferes_records', JSON.stringify(records));
            renderTable();
            Swal.fire({
                title: translations[currentLang].msg_deleted,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#FFFFFF',
                color: '#000000'
            });
        }
    });
}

function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;

    Swal.fire({
        title: translations[currentLang].title_edit,
        html: `
            <div style="text-align: left; margin-top: 10px;">
                <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_name}</label>
                <input id="edit-nombre" class="swal2-input" value="${record.nombre}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">
                
                <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_rut}</label>
                <input id="edit-rut" class="swal2-input" value="${record.rut}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">
                
                <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_phone}</label>
                <input id="edit-celular" type="tel" class="swal2-input" value="${record.celular}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box;">
                
                <div style="display:flex; gap:10px;">
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_truck_plate}</label>
                        <input id="edit-camion" class="swal2-input" value="${record.patente_camion}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box; text-transform:uppercase;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_chassis_plate}</label>
                        <input id="edit-chasis" class="swal2-input" value="${record.patente_chasis}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box; text-transform:uppercase;">
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_container}</label>
                        <input id="edit-contenedor" class="swal2-input" value="${record.numero_contenedor || ''}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box; text-transform:uppercase;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-weight:bold; font-size: 0.9em; color:#475569;">${translations[currentLang].lbl_seal}</label>
                        <input id="edit-sello" class="swal2-input" value="${record.sello_naviera || ''}" style="margin-top:0; margin-bottom:15px; width: 100%; box-sizing: border-box; text-transform:uppercase;">
                    </div>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: translations[currentLang].btn_save,
        cancelButtonText: translations[currentLang].btn_cancel,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#64748B',
        background: '#FFFFFF',
        color: '#000000',
        width: '600px',
        preConfirm: () => {
            const nombre = document.getElementById('edit-nombre').value;
            const rut = document.getElementById('edit-rut').value;
            const celular = document.getElementById('edit-celular').value;
            const camion = document.getElementById('edit-camion').value.toUpperCase();
            const chasis = document.getElementById('edit-chasis').value.toUpperCase();
            const contenedor = document.getElementById('edit-contenedor').value.toUpperCase();
            const sello = document.getElementById('edit-sello').value.toUpperCase();
            
            if (!nombre || !rut || !celular || !camion || !chasis) {
                Swal.showValidationMessage('Por favor completa los campos obligatorios / Por favor preencha os campos obrigatórios');
                return false;
            }
            return { nombre, rut, celular, camion, chasis, contenedor, sello };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            record.nombre = result.value.nombre;
            record.rut = result.value.rut;
            record.celular = result.value.celular;
            record.patente_camion = result.value.camion;
            record.patente_chasis = result.value.chasis;
            record.numero_contenedor = result.value.contenedor;
            record.sello_naviera = result.value.sello;
            
            localStorage.setItem('portalChoferes_records', JSON.stringify(records));
            renderTable();
            Swal.fire({
                title: translations[currentLang].msg_edit_success,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#FFFFFF',
                color: '#000000'
            });
        }
    });
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
        "Contenedor": r.numero_contenedor || '-',
        "Sello Naviera": r.sello_naviera || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
    
    // Auto-size columns roughly
    const wscols = [
        {wch: 20}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 20}
    ];
    worksheet['!cols'] = wscols;

    const dateStr = new Date().toISOString().slice(0,10);
    XLSX.writeFile(workbook, `Registro_Choferes_${dateStr}.xlsx`);
}
