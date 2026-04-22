const translations = {
    es: {
        title_register: "Registro de Choferes",
        subtitle_register: "Por favor, ingrese sus datos de llegada",
        lbl_name: "Nombre y apellido",
        lbl_rut: "RUT / Documento",
        lbl_phone: "Número de celular",
        lbl_truck_plate: "Patente Camión",
        lbl_chassis_plate: "Patente Chasis",
        lbl_container: "Número de Contenedor",
        lbl_seal: "Número Sello Naviera",
        btn_submit: "Registrar Llegada",
        link_history: "Ver historial de ingresos",
        title_history: "Historial de Ingresos",
        btn_export: "Exportar",
        btn_back: "Volver",
        th_date: "Hora Ingreso",
        th_name: "Nombre",
        th_rut: "RUT",
        th_phone: "Celular",
        th_truck: "Camión",
        th_chassis: "Chasis",
        th_container: "Contenedor",
        th_seal: "Sello Naviera",
        msg_success_title: "¡Registro Exitoso!",
        msg_success_text: "Tus datos han sido registrados correctamente.",
        page_of: "Página {0} de {1}",
        auth_title: "Acceso Administrativo",
        auth_confirm: "Ingresar",
        auth_error: "Contraseña incorrecta"
    },
    pt: {
        title_register: "Registro de Motoristas",
        subtitle_register: "Por favor, insira seus dados de chegada",
        lbl_name: "Nome e sobrenome",
        lbl_rut: "CPF / Documento",
        lbl_phone: "Número de celular",
        lbl_truck_plate: "Placa do Caminhão",
        lbl_chassis_plate: "Placa do Chassi",
        lbl_container: "Número do Contêiner",
        lbl_seal: "Número do Selo",
        btn_submit: "Registrar Chegada",
        link_history: "Ver histórico de entradas",
        title_history: "Histórico de Entradas",
        btn_export: "Exportar",
        btn_back: "Voltar",
        th_date: "Hora de Entrada",
        th_name: "Nome",
        th_rut: "Documento",
        th_phone: "Celular",
        th_truck: "Caminhão",
        th_chassis: "Chassi",
        th_container: "Contêiner",
        th_seal: "Selo",
        msg_success_title: "Registro Efetuado!",
        msg_success_text: "Seus dados foram registrados com sucesso.",
        page_of: "Página {0} de {1}",
        auth_title: "Acesso Administrativo",
        auth_confirm: "Entrar",
        auth_error: "Senha incorreta"
    }
};

let currentLang = 'es';

function setLanguage(lang) {
    currentLang = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    // Update texts in DOM
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                // Not needed since we use labels instead of visible placeholders
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Update dynamic texts
    if(typeof updatePaginationText === 'function') {
        updatePaginationText();
    }
}
