let response, result, terapeuta;
let preco, tempo;

let responseUsuario;
let dataUsuario;
let cliente_id;
let terapeuta_id;

document.addEventListener('DOMContentLoaded', async function() 
{
    responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
    dataUsuario = await responseUsuario.json();
    terapeuta_id = dataUsuario.usuario.id;

    carregarAgendamentos();

    try 
    {
        response = await fetch(`${API_BASE_URL}/terapeutas/${-1}`, { credentials: 'include' });
        result = await response.json();
        terapeuta = result.data;

        const imagemObj = terapeuta.usuario.imagem;

        if (imagemObj && imagemObj.data) 
        {
            const byteArray = new Uint8Array(imagemObj.data);
            const blob = new Blob([byteArray], { type: 'image/*' });
            const imageUrl = URL.createObjectURL(blob);
            document.getElementById('perfil-img').src = imageUrl;
        }
    
        preco = (terapeuta.preco_sessao / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    
        const horas = Math.floor(terapeuta.duracao_sessao / 60);
        const minutos = terapeuta.duracao_sessao % 60;
        tempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    
        document.getElementById('title').innerText    = terapeuta.usuario.nome.toUpperCase();
        document.getElementById('fantasia').innerText = terapeuta.fantasia || '';
        document.getElementById('razao').innerText    = terapeuta.razao || '';
        document.getElementById('nome').innerText     = terapeuta.usuario.nome;
        document.getElementById('cpf').innerText      = terapeuta.usuario.cpf || '';
        document.getElementById('email').innerText    = terapeuta.usuario.email;
        document.getElementById('telefone').innerText = terapeuta.usuario.telefone;
        document.getElementById('endereco').innerText = terapeuta.usuario.endereco || '';
    
        document.getElementById('especialidade').innerText = terapeuta.especialidade || '';
        document.getElementById('area').innerText          = terapeuta.area || '';
    
        document.getElementById('tempo').innerText = tempo || '';
        document.getElementById('preco').innerText = preco || '';
    
        if (terapeuta.pagamento)
        {
            document.getElementById('conta-banco').innerText = 
            (terapeuta.pagamento.banco || 'Banco') + ' | ' + (terapeuta.pagamento.agencia || 'Agência') + ' | ' +  (terapeuta.pagamento.conta || 'Conta') + ' | ' +  
            (terapeuta.pagamento.favorecido || terapeuta.usuario.nome) + ' | ' +  (terapeuta.pagamento.pix || 'PIX');
        }
        else 
        {
            const bankTestData = { terapeuta_id: terapeuta.usuario_id, banco: '', agencia: '', conta: '', favorecido: '', pix: '' }

            salvarContaBancaria(bankTestData);
        }
    } 
    catch (error) 
    {
        showToast(error, 'error');
        console.log(error);
    }

    document.getElementById('modal-chat').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
    document.getElementById('modal-anamnese').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
    document.getElementById('modal-notificacao').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
});

async function showEditModal(section) 
{
    const modal = document.getElementById('editModal');
    const form = document.getElementById('modal-form');
    const title = document.getElementById('modal-title');

    form.innerHTML = '';
    form.dataset.section = section;

    switch (section) 
    {
        case 'dados-cadastrais':
            title.innerText = 'Editar Dados Cadastrais';
            form.innerHTML = `
                <div class="modal-field">
                    <label class="modal-label">Nome Fantasia</label>
                    <input type="text" name="fantasia" value="${terapeuta.fantasia || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Razão Social</label>
                    <input type="text" name="razao" value="${terapeuta.razao || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Representante Legal</label>
                    <input type="text" name="nome" value="${terapeuta.usuario.nome}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">CPF</label>
                    <input type="text" name="cpf" value="${terapeuta.usuario.cpf || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Email</label>
                    <input type="email" name="email" value="${terapeuta.usuario.email}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Telefone</label>
                    <input type="text" name="telefone" value="${terapeuta.usuario.telefone}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Endereço</label>
                    <input type="text" name="endereco" value="${terapeuta.usuario.endereco || ''}" class="modal-input"/>
                </div>
            `;
            break;
        case 'biografia':
            title.innerText = 'Editar Biografia';
            form.innerHTML = `
                <div class="modal-field">
                    <img src="" alt="" id="preview-perfil-img" style="width:100px; height:100px; border-radius:50%">
                    <label class="file-upload" style="align-self:start">
                        <form enctype="multipart/form-data"><input type="file" name="imagem" id="perfil-img-upload" class="modal-input file-hidden" accept="image/*"/></form>
                        <span class="file-text" style="font-size:14px; color:#555; ">Escolher foto de perfil</span>
                    </label>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Biografia</label>
                    <textarea name="bio" class="modal-input" style="resize:none; height:195px;">${terapeuta.bio || ''}</textarea>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Especialidade</label>
                    <select class="modal-select" id="especialidade-select"></select>
                    <input type="text" name="especialidade" id="especialidade-input" value="${terapeuta.especialidade || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Área de Trabalho <i>(Tipos de tratamento)</i></label>
                    <input type="text" name="area" id="area-input" value="${terapeuta.area || ''}" class="modal-input" placeholder="Ex: Depressão, Ansiedade, Luto"/>
                </div>
            `;
            await carregarSelects();
            break;
        case 'honorarios':
            title.innerText = 'Editar Honorários';
            form.innerHTML = `
                <div class="modal-field">
                    <label class="modal-label">Tempo da Sessão</label>
                    <input type="text" name="tempo" value="${tempo || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Valor por Sessão</label>
                    <input type="text" name="preco" value="${preco || ''}" class="modal-input"/>
                </div>
            `;
            break;
        case 'conta-bancaria':
            title.innerText = 'Editar Conta Bancária';
            form.innerHTML = `
                <div class="modal-field">
                    <label class="modal-label">Banco</label>
                    <input type="text" name="banco" value="${terapeuta.pagamento.banco || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Agência</label>
                    <input type="text" name="agencia" value="${terapeuta.pagamento.agencia || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Conta</label>
                    <input type="text" name="conta" value="${terapeuta.pagamento.conta || ''}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">Favorecido</label>
                    <input type="text" name="favorecido" value="${terapeuta.pagamento.favorecido || terapeuta.usuario.nome}" class="modal-input"/>
                </div>
                <div class="modal-field">
                    <label class="modal-label">PIX</label>
                    <input type="text" name="pix" value="${terapeuta.pagamento.pix || ''}" class="modal-input"/>
                </div>
            `;
            break;
        default:
            title.innerText = 'Editar Dados';
    }

    modal.classList.remove('hidden');
}

document.querySelectorAll('.edit-btn').forEach(button => 
{
    button.addEventListener('click', () => { const section = button.dataset.section; showEditModal(section); });
});

document.getElementById('editModal').addEventListener('click', (event) => 
{
    if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); }
});

document.getElementById('modal-form').addEventListener('submit', async function (e) 
{
    e.preventDefault();

    response = await fetch(`${API_BASE_URL}/terapeutas/${-1}`, { credentials: 'include' });
    result = await response.json();
    terapeuta = result.data;

    const section = e.target.dataset.section;
    const formData = new FormData(e.target);
    let data = Object.fromEntries(formData.entries());

    switch (section) {
        case 'dados-cadastrais':
            salvarDadosCadastrais(data);
            break;
        case 'biografia':
            salvarBiografia(data);
            break;
        case 'honorarios':
            salvarHonorarios(data);
            break;
        case 'conta-bancaria':
            salvarContaBancaria(data);
            break;
        default:
            console.warn('Seção não reconhecida:', section);
    }
});

async function carregarSelects() 
{
    document.getElementById('perfil-img-upload').addEventListener('change', function(e) 
    {
        const file = e.target.files[0];

        const preview = document.getElementById('preview-perfil-img');

        if (file) 
        {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    const especialidadeSelect = document.getElementById('especialidade-select');

    const especialidades = [
        "Psicologia",
        "Psicoterapia",
        "Psicanálise",
        "Terapia Cognitivo-Comportamental (TCC)",
        "Terapia Sistêmica",
        "Neuropsicologia",
        "Psiquiatria",
        "Fonoaudiologia",
        "Terapia Ocupacional",
        "Pranaterapia",
        "Reiki",
        "ThetaHealing",
        "Barras de Access",
        "Constelação Familiar",
        "Acupuntura",
        "Auriculoterapia",
        "Cromoterapia",
        "Fitoterapia",
        "Florais de Bach",
        "Aromaterapia",
        "Homeopatia",
        "Yoga Terapêutica",
        "Meditação Guiada",
        "Shiatsu",
        "Reflexologia",
        "Massoterapia",
        "Quiropraxia",
        "Bioenergética",
        "Coaching de Vida",
        "Coaching Emocional",
        "Mentoria Terapêutica",
        "Inteligência Emocional",
        "Terapia do Propósito",
        "Alinhamento Energético",
        "Terapia Multidimensional",
        "Terapia Vibracional",
        "Toque Quântico",
        "Técnicas de Respiração Consciente (Breathwork)",
        "Terapia com Cristais",
        "Radiestesia e Radiônica",
        "Limpeza Energética",
        "EFT - Técnica de Libertação Emocional",
        "Healing Hands",
        "Reprogramação Mental / Reprogramação de Crenças",
        "Biofeedback Emocional",
        "Outros"
    ];

    especialidadeSelect.innerHTML = '';

    especialidadeSelect.innerHTML = `<option value="">Selecione uma especialidade</option>`;

    especialidades.forEach(especialidade => 
    {
        const option = document.createElement('option');
        option.value = especialidade;
        option.textContent = especialidade;
        especialidadeSelect.appendChild(option);
    });

    if (terapeuta.especialidade) especialidadeSelect.value = terapeuta.especialidade;

    especialidadeSelect.addEventListener('change', function () 
    {
        const input = document.getElementById('especialidade-input');
        const text = input.value ? ', ' : '';
        input.value += `${text}${especialidadeSelect.value}`;
    });
}

async function salvarDadosCadastrais(data)
{
    if (data.cpf && data.cpf.trim() !== '')
    {
        const cpf = validarCPF(data.cpf);
        if (cpf == false)
        {
            showToast('Digite um cpf válido', 'error');
            return;
        }
    }

    const responseU = await fetch(`${API_BASE_URL}/usuarios/${terapeuta.usuario_id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });

    const { fantasia, razao } = data;
    const responseT = await fetch(`${API_BASE_URL}/terapeutas/${terapeuta.usuario_id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fantasia, razao }),
        credentials: 'include'
    });

    const resultU = await responseU.json();
    const resultT = await responseT.json();

    if (!responseU.ok || !responseT.ok)
    {
        showToast('Erro ao atualizar dados', 'error');
        console.log(resultU.message);
        console.log(resultT.message);
        return;
    }

    showToast('Sucesso!');
    setTimeout(() => window.location.reload(), 500);
}

async function salvarBiografia(data)
{
    const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeuta.usuario_id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    const fileInput = document.getElementById('perfil-img-upload');
    const file = fileInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('imagem', file);

    const usuarioResponse = await fetch(`${API_BASE_URL}/usuarios/${terapeuta.usuario_id}`, 
    {
        method: 'PUT',
        body: formData,
        credentials: 'include'
    });

    const usuarioResult = await usuarioResponse.json();

    if (!usuarioResponse.ok)
    {
        showToast(usuarioResult.message, 'error');
        return;
    }

    showToast('Sucesso!');
    setTimeout(() => window.location.reload(), 500);
}

async function salvarHonorarios(data) 
{
    let duracaoEmMinutos;
    if (data.tempo)
    {
        const [horas, minutos] = data.tempo.split(':').map(Number);
        duracaoEmMinutos = (horas * 60) + minutos;
    }

    let precoEmCentavos;
    if (data.preco)
    {
        const precoLimpo = data.preco.replace(/[^\d,]/g, '').replace(',', '.');
        precoEmCentavos = Math.round(parseFloat(precoLimpo) * 100);
    }

    const duracao_sessao = duracaoEmMinutos
    const preco_sessao = precoEmCentavos;

    const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeuta.usuario_id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duracao_sessao, preco_sessao }),
        credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    showToast('Sucesso!');
    setTimeout(() => window.location.reload(), 500);
}

async function salvarContaBancaria(data)
{
    const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeuta.usuario_id}/banco`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    showToast('Sucesso!');
    setTimeout(() => window.location.reload(), 500);
}

async function carregarAgendamentos()
{
    try 
    {
        const responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
        const dataUsuario = await responseUsuario.json();
        const terapeuta_id = dataUsuario.usuario.id;

        const response = await fetch(`${API_BASE_URL}/atendimentos/terapeutas/${terapeuta_id}`, { credentials: 'include' });
        const result = await response.json();
        const atendimentos = result.data;
        
        if (!atendimentos || atendimentos == null || atendimentos.length == 0) return;

        const mainSec = document.getElementById('hist-container');
        mainSec.innerHTML = '';

        for (const atendimento of atendimentos)
        {
            const date = new Date(atendimento.dia);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const dia = `${day}/${month}/${year} - ${hours}:${minutes}`;

            const horas = Math.floor(atendimento.terapeuta.duracao_sessao / 60);
            const minutos = atendimento.terapeuta.duracao_sessao % 60;
            tempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    
            preco = (atendimento.terapeuta.preco_sessao / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <div class="info">
                    <label>FOTO</label>
                    <label><strong>${atendimento.cliente.nome}</strong></label>
                    <button class="chat-btn" onclick="abrirChat('${atendimento.cliente.nome}', ${atendimento.cliente.id})">CHAT</button>
                </div>
                <div class="texts">
                    <div><p><strong>Data:</strong> ${dia}</p></div>
                    <div><p><strong>Tempo de sessão: </strong> ${tempo || 'Não foi possível carregar'}</p></div>
                </div>
                <div class="btns">
                    ${atendimento.iniciado && !atendimento.finalizado_terapeuta 
                    ? `<button class="atend-btn" onclick="concluirAtendimento(${atendimento.id})">Concluir atendimento</button> <br>` : ''}
                    ${atendimento.finalizado
                    ? `<button class="atend-btn" onclick="abrirAnamnese(${atendimento.id})">ANAMINESE</button> <br>` : ''}
                </div>
            `;

            mainSec.appendChild(card);
        }
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

async function carregarMensagens() 
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/mensagens/${terapeuta_id}/${cliente_id}`, { credentials: 'include' });
        const mensagens = await response.json();

        if (!mensagens || mensagens == null || mensagens.length == 0) return;

        const container = document.getElementById('msg-container');
        container.innerHTML = '';

        for (const mensagem of mensagens)
        {
            const card = document.createElement('div');
            card.classList.add('msg-card');

            card.innerHTML = `
                <div class="texts">
                    <div><label><strong>${mensagem.remetente.nome} (${mensagem.remetente.tipo})</strong></div>
                    <div><p>${mensagem.mensagem}</p></div>
                </div>
            `;

            container.appendChild(card);
        }
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

async function abrirChat(nome, id) 
{
    cliente_id = id;

    document.getElementById("msg-title").innerText = `CHAT - ${nome}`;

    carregarMensagens();

    const modal = document.getElementById("modal-chat");
    modal.classList.remove("hidden");
}

async function enviarMsg()
{
    try 
    {
        const mensagem = document.getElementById('msg-text').value;
    
        const response = await fetch(`${API_BASE_URL}/mensagens`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remetente_id: terapeuta_id, destinatario_id: cliente_id, mensagem }),
            credentials: 'include'
        });
    
        const result  = await response.json();
    
        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }
    
        document.getElementById('msg-text').value = '';
        carregarMensagens();
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

async function concluirAtendimento(id) 
{
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizado_terapeuta: true }),
        credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    showToast('Atendimento finalizado com sucesso!');
    carregarAgendamentos();
}

async function abrirAnamnese(atendimentoId) 
{
    document.getElementById("anam-btn").onclick = () => { salvarAnamnese(atendimentoId); };

    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}`, { headers: { 'Content-Type': 'application/json' }, credentials: 'include' });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    document.getElementById("anam-resumo").value = result.data.resumo;
    document.getElementById("anam-sintomas").value = result.data.sintomas;

    const modal = document.getElementById("modal-anamnese");
    modal.classList.remove("hidden");
}

async function salvarAnamnese(atendimentoId) 
{
    try 
    {
        const resumo = document.getElementById("anam-resumo").value;
        const sintomas = document.getElementById("anam-sintomas").value;
    
        const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}`, 
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumo, sintomas }),
            credentials: 'include'
        });
    
        const result = await response.json();
    
        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }
    
        document.getElementById("anam-resumo").value = '';
        document.getElementById("anam-sintomas").value = '';
        document.getElementById('modal-anamnese').classList.add('hidden');
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

function formatarData(dataISO) 
{
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

async function abrirNotificacoes()
{
    const modal = document.getElementById("modal-notificacao");
    modal.classList.remove("hidden");

    try 
    {
        const response = await fetch(`${API_BASE_URL}/notificacoes/${terapeuta_id}`, { credentials: 'include' });
        const nots = await response.json();

        if (!nots || nots == null || nots.length == 0) return;

        const container = document.getElementById('notificacao-container');
        container.innerHTML = '';

        for (const notificacao of nots)
        {
            const criadoEm = formatarData(notificacao.createdAt);

            const card = document.createElement('div');
            card.classList.add('notificacao-card');

            card.innerHTML = `
                <div class="texts">
                    <div><p>${notificacao.mensagem} <span>(${criadoEm})</span></p></div>
                    <div><button onclick="apagarNotificacao(${notificacao.id})"><i class="fa fa-trash"></i></button></div>
                </div>
            `;

            container.appendChild(card);
        }
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

async function apagarNotificacao(id)
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/notificacoes/${id}`, 
        {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
    
        const result = await response.json();
    
        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }
    
        document.getElementById('modal-notificacao').classList.add('hidden');
        abrirNotificacoes();
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.section');

const inicioMenuItems = document.querySelectorAll('.inicio-menu-item');
const inicioSections = document.querySelectorAll('.inicio-section');

function showSection(id) 
{
    sections.forEach(section => { section.classList.remove('active'); });

    const target = document.getElementById(id);
    if (target) { target.classList.add('active'); }
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-section');
        showSection(targetId);
    });
});

function showInicioSection(id) 
{
    inicioSections.forEach(section => { section.classList.remove('active'); });

    const target = document.getElementById(id);
    if (target) { target.classList.add('active'); }
}

inicioMenuItems.forEach(item => {
    item.addEventListener('click', () => {
        inicioMenuItems.forEach(item => { item.classList.remove('active'); });
        item.classList.add('active');
        const targetId = item.getAttribute('data-section');
        showInicioSection(targetId);
    });
});

showSection('inicio');
showInicioSection('evento');

document.getElementById('pub-evento-btn').addEventListener('click', async function()
{
    try 
    {
        const formData = new FormData();

        const fileInput = document.querySelector('.file-hidden');
        if (fileInput.files[0]) formData.append('imagem', fileInput.files[0]);

        const dataEvento = document.getElementById('evento-data').value;
        const horaEvento = document.getElementById('evento-hora').value;
        const dia = `${dataEvento} ${horaEvento}:00`;
        
        formData.append('terapeuta_id', terapeuta_id);
        formData.append('nome', document.getElementById('evento-nome').value);
        formData.append('dia', dia);
        formData.append('tipo', document.querySelector('.inicio-column .modal-select').value);
        formData.append('local', document.getElementById('evento-local').value);
        formData.append('detalhes', document.getElementById('evento-detalhes').value);
        formData.append('link', document.getElementById('evento-link').value);

        const response = await fetch(`${API_BASE_URL}/eventos`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();
    
        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }

        showToast('Sucesso!');
        setTimeout(() => window.location.reload(), 500);
        
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
});

document.getElementById('evento-img-upload').addEventListener('change', function(e) 
{
    const file = e.target.files[0];
    const fileName = e.target.files[0]?.name || 'Nenhum arquivo selecionado';
    
    document.querySelector('.file-name').textContent = fileName;

    const preview = document.getElementById('preview-img');

    if (file) 
    {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function validarCPF(cpf) 
{
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;

    if (digito1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;

    return digito2 === parseInt(cpf.charAt(10));
}