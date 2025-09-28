// Dados de exemplo
const users = JSON.parse(localStorage.getItem('users')) || [];
const vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isAdmin = currentUser && currentUser.email === 'admin@garagem.com';

// Elementos DOM
const garageDoor = document.getElementById('garageDoor');
const openDoorBtn = document.getElementById('openDoorBtn');
const closeDoorBtn = document.getElementById('closeDoorBtn');
const alarmToggle = document.getElementById('alarmToggle');
const alarmStatus = document.getElementById('alarmStatus');
const cityInput = document.getElementById('cityInput');
const searchWeatherBtn = document.getElementById('searchWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const currentDateEl = document.getElementById('currentDate');
const vehicleForm = document.getElementById('vehicleForm');
const vehicleList = document.getElementById('vehicleList');
const adminSection = document.getElementById('adminSection');
const clientList = document.getElementById('clientList');
const viewClientsBtn = document.getElementById('viewClientsBtn');
const exportDataBtn = document.getElementById('exportDataBtn');

// Modal elements
const themeToggle = document.getElementById('themeToggle');
const adminModeBtn = document.getElementById('adminModeBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const paymentModal = document.getElementById('paymentModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const closePaymentModal = document.getElementById('closePaymentModal');
const submitLogin = document.getElementById('submitLogin');
const submitRegister = document.getElementById('submitRegister');
const confirmPayment = document.getElementById('confirmPayment');
const closeModalButtons = document.querySelectorAll('.close-modal');
const paymentOptions = document.querySelectorAll('.payment-option');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar data atual
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Verificar se usuário está logado
    updateAuthUI();

    // Carregar veículos se usuário estiver logado
    if (currentUser) {
        loadUserVehicles();
    }

    // Se for admin, mostrar seção administrativa
    if (isAdmin) {
        adminSection.classList.add('active');
        loadClients();
    }

    // Configurar previsão do tempo padrão
    getWeatherData('São Paulo');

    // Configurar tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    updateThemeButton();
});

// Controle do portão da garagem
openDoorBtn.addEventListener('click', function() {
    garageDoor.classList.add('open');
    if (alarmToggle.checked) {
        triggerAlarm();
    }
});

closeDoorBtn.addEventListener('click', function() {
    garageDoor.classList.remove('open');
});

        // Controle do alarme
        alarmToggle.addEventListener('change', function() {
            if (this.checked) {
                alarmStatus.innerHTML = '<i class="fas fa-check-circle"></i><span>Alarme Ativado</span>';
                alarmStatus.classList.add('armed');
                document.body.classList.add('alarm-active');
            } else {
                alarmStatus.innerHTML = '<i class="fas fa-times-circle"></i><span>Alarme Desativado</span>';
                alarmStatus.classList.remove('armed');
                document.body.classList.remove('alarm-active');
            }
        });

function triggerAlarm() {
    alert('⚠️ ALARME ATIVADO! O portão foi aberto com o alarme ligado!');
    // Aqui poderia ter som de alarme, notificação, etc.
}

// Previsão do tempo
searchWeatherBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

function getWeatherData(city) {
    // Simulação de API de previsão do tempo
    const weatherData = {
        'São Paulo': { temp: 25, desc: 'Nublado', icon: 'cloud' },
        'Rio de Janeiro': { temp: 30, desc: 'Ensolarado', icon: 'sun' },
        'Belo Horizonte': { temp: 27, desc: 'Parcialmente nublado', icon: 'cloud-sun' },
        'Porto Alegre': { temp: 20, desc: 'Chuvoso', icon: 'cloud-rain' },
        'Salvador': { temp: 32, desc: 'Ensolarado', icon: 'sun' },
        'default': { temp: 26, desc: 'Claro', icon: 'sun' }
    };

    const data = weatherData[city] || weatherData['default'];
    
    weatherDisplay.innerHTML = `
        <i class="fas fa-${data.icon} weather-icon"></i>
        <div class="weather-temp">${data.temp}°C</div>
        <div class="weather-desc">${data.desc}</div>
        <div class="weather-city">${city}, BR</div>
    `;
}

// Cadastro de veículos
vehicleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Por favor, faça login para cadastrar um veículo.');
        loginModal.classList.add('active');
        return;
    }
    
    const vehicle = {
        id: Date.now(),
        model: document.getElementById('vehicleModel').value,
        plate: document.getElementById('vehiclePlate').value,
        year: document.getElementById('vehicleYear').value,
        color: document.getElementById('vehicleColor').value,
        lastService: document.getElementById('lastService').value,
        nextService: document.getElementById('nextService').value,
        userId: currentUser.id
    };
    
    vehicles.push(vehicle);
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    
    addVehicleCard(vehicle);
    addCarToGarage(vehicle);
    vehicleForm.reset();

    alert('Veículo cadastrado com sucesso!');
});

function loadUserVehicles() {
    if (!currentUser) return;

    vehicleList.innerHTML = '';
    const garageInterior = document.getElementById('garageInterior');
    garageInterior.innerHTML = '';
    const userVehicles = vehicles.filter(v => v.userId === currentUser.id);

    userVehicles.forEach(vehicle => {
        addVehicleCard(vehicle);
        addCarToGarage(vehicle);
    });
}

function addVehicleCard(vehicle) {
    const nextServiceDate = new Date(vehicle.nextService);
    const today = new Date();
    const dueSoon = (nextServiceDate - today) / (1000 * 60 * 60 * 24) < 30;
    
    const vehicleCard = document.createElement('div');
    vehicleCard.className = 'vehicle-card';
    vehicleCard.innerHTML = `
        <div class="vehicle-image">
            <img src="https://placeholder-image-service.onrender.com/image/300x150?prompt=${encodeURIComponent(vehicle.color + ' ' + vehicle.model + ' car')}&id=${vehicle.id}" alt="${vehicle.color} ${vehicle.model} automobile">
        </div>
        <div class="vehicle-details">
            <div class="vehicle-model">${vehicle.model}</div>
            <div class="vehicle-info">
                <span>Placa: ${vehicle.plate}</span>
                <span>Ano: ${vehicle.year}</span>
            </div>
            <div class="vehicle-info">
                <span>Última revisão: ${new Date(vehicle.lastService).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="vehicle-info">
                <span>Próxima revisão: ${new Date(vehicle.nextService).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="vehicle-status ${dueSoon ? 'status-due' : 'status-ok'}">
                <i class="fas ${dueSoon ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${dueSoon ? 'Revisão em breve' : 'Revisão em dia'}</span>
            </div>
            <div class="vehicle-actions" style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-danger delete-vehicle" data-vehicle-id="${vehicle.id}" style="flex: 1;">
                    <i class="fas fa-trash"></i> Excluir
                </button>
                ${dueSoon ? `<button class="btn btn-primary schedule-service" data-vehicle-id="${vehicle.id}" style="flex: 1;">
                    <i class="fas fa-calendar-check"></i> Agendar Revisão
                </button>` : ''}
            </div>
        </div>
    `;
    
    vehicleList.appendChild(vehicleCard);

    // Adicionar evento para exclusão de veículo
    const deleteBtn = vehicleCard.querySelector('.delete-vehicle');
    deleteBtn.addEventListener('click', function() {
        const vehicleId = parseInt(this.getAttribute('data-vehicle-id'));
        const index = vehicles.findIndex(v => v.id === vehicleId);
        if (index !== -1) {
            vehicles.splice(index, 1);
            localStorage.setItem('vehicles', JSON.stringify(vehicles));
            loadUserVehicles();
            alert('Veículo excluído com sucesso!');
        }
    });

    // Adicionar evento para agendamento de revisão
    if (dueSoon) {
        const scheduleBtn = vehicleCard.querySelector('.schedule-service');
        scheduleBtn.addEventListener('click', function() {
            paymentModal.classList.add('active');
            // Aqui poderia armazenar qual veículo está sendo agendado
            localStorage.setItem('schedulingVehicle', vehicle.id);
        });
    }
}

function addCarToGarage(vehicle) {
    const garageInterior = document.getElementById('garageInterior');
    const carDiv = document.createElement('div');
    carDiv.className = 'garage-car';
    carDiv.innerHTML = `<img src="img/OIP.jpeg" alt="${vehicle.color} ${vehicle.model} car">`;
    garageInterior.appendChild(carDiv);
}

// Sistema de autenticação
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
});

function updateThemeButton() {
    const isDark = document.body.classList.contains('dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Modo Claro' : '<i class="fas fa-moon"></i> Modo Escuro';
}

adminModeBtn.addEventListener('click', function() {
    const password = prompt('Digite a senha do administrador:');
    if (password === 'admin123') {
        isAdmin = true;
        adminSection.classList.add('active');
        loadClients();
        alert('Modo administrador ativado!');
    } else {
        alert('Senha incorreta!');
    }
});

loginBtn.addEventListener('click', function() {
    loginModal.classList.add('active');
});

registerBtn.addEventListener('click', function() {
    registerModal.classList.add('active');
});

closeLoginModal.addEventListener('click', function() {
    loginModal.classList.remove('active');
});

closeRegisterModal.addEventListener('click', function() {
    registerModal.classList.remove('active');
});

closePaymentModal.addEventListener('click', function() {
    paymentModal.classList.remove('active');
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.closest('.modal-overlay').classList.remove('active');
    });
});

submitLogin.addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        isAdmin = currentUser.email === 'admin@garagem.com';
        
        updateAuthUI();
        loadUserVehicles();
        
        if (isAdmin) {
            adminSection.classList.add('active');
            loadClients();
        }
        
        loginModal.classList.remove('active');
        alert('Login realizado com sucesso!');
    } else {
        alert('Email ou senha incorretos.');
    }
});

submitRegister.addEventListener('click', function() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        alert('Este email já está cadastrado.');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        isAdmin: email === 'admin@garagem.com' // Para simplificar, apenas este email será admin
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    registerModal.classList.remove('active');
    alert('Conta criada com sucesso! Você já pode fazer login.');
});

function updateAuthUI() {
    if (currentUser) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        
        // Adicionar botão de logout
        if (!document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'btn btn-outline';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('currentUser');
                currentUser = null;
                isAdmin = false;
                updateAuthUI();
                vehicleList.innerHTML = '';
                const garageInterior = document.getElementById('garageInterior');
                garageInterior.innerHTML = '';
                adminSection.classList.remove('active');
                alert('Logout realizado com sucesso!');
            });
            
            document.querySelector('.auth-buttons').appendChild(logoutBtn);
        }
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }
}

// Sistema de pagamento
paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
        paymentOptions.forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
    });
});

confirmPayment.addEventListener('click', function() {
    const selectedMethod = document.querySelector('.payment-option.selected');
    if (!selectedMethod) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }
    
    paymentModal.classList.remove('active');
    alert(`Pagamento confirmado via ${selectedMethod.textContent.trim()}! Revisão agendada com sucesso.`);
    
    // Atualizar data da próxima revisão (6 meses à frente)
    const vehicleId = localStorage.getItem('schedulingVehicle');
    if (vehicleId) {
        const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(vehicleId));
        if (vehicleIndex !== -1) {
            const nextServiceDate = new Date();
            nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);
            
            vehicles[vehicleIndex].lastService = new Date().toISOString().split('T')[0];
            vehicles[vehicleIndex].nextService = nextServiceDate.toISOString().split('T')[0];
            
            localStorage.setItem('vehicles', JSON.stringify(vehicles));
            loadUserVehicles();
        }
    }
});

// Área administrativa
viewClientsBtn.addEventListener('click', function() {
    loadClients();
});

exportDataBtn.addEventListener('click', function() {
    // Simular exportação de dados
    const dataStr = JSON.stringify({ users, vehicles }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'garagem_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

function loadClients() {
    if (!isAdmin) return;
    
    clientList.innerHTML = '';
    
    users.forEach(user => {
        if (user.email === 'admin@garagem.com') return; // Não mostrar o admin na lista
        
        const userVehicles = vehicles.filter(v => v.userId === user.id);
        
        const clientCard = document.createElement('div');
        clientCard.className = 'client-card';
        clientCard.innerHTML = `
            <div class="client-header">
                <div class="client-name">${user.name}</div>
                <div class="client-email">${user.email}</div>
            </div>
            <div class="client-details">
                <div>Veículos cadastrados: ${userVehicles.length}</div>
            </div>
            ${userVehicles.length > 0 ? `
            <div class="client-vehicles">
                <strong>Veículos:</strong>
                ${userVehicles.map(vehicle => `
                    <div class="vehicle-item">
                        <span>${vehicle.model} (${vehicle.plate})</span>
                        <span>${new Date(vehicle.nextService).toLocaleDateString('pt-BR')}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
        
        clientList.appendChild(clientCard);
    });
}

// Criar usuário admin padrão se não existir
if (!users.some(u => u.email === 'admin@garagem.com')) {
    users.push({
        id: 1,
        name: 'Administrador',
        email: 'admin@garagem.com',
        password: 'admin123',
        isAdmin: true
    });
    localStorage.setItem('users', JSON.stringify(users));
}
