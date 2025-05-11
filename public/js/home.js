let responseUsuario;
let dataUsuario;
let usuario;
let usuario_id;

let params = "";

document.addEventListener('DOMContentLoaded', async function() 
{
    params = window.location.search;

    carregarTerapeutas();
    carregarEventos();

    document.getElementById('modal-agendamento').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
    document.getElementById('modal-perfil').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });

    responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
    dataUsuario = await responseUsuario.json();
    usuario_id = dataUsuario.usuario.id;

    try 
    {
        response = await fetch(`${API_BASE_URL}/usuarios/${-1}`, { credentials: 'include' });
        result = await response.json();
        usuario = result.data;

        const imagemObj = usuario.imagem;

        if (imagemObj && imagemObj.data) 
        {
            const byteArray = new Uint8Array(imagemObj.data);
            const blob = new Blob([byteArray], { type: 'image/*' });
            const imageUrl = URL.createObjectURL(blob);
            document.getElementById('perfil-img').src = imageUrl;
        }
    }
    catch (error) 
    {
        showToast(error, 'error');
        console.log(error);
    }
});

function pesquisarComFiltro() 
{
    const filtroSelect = document.getElementById('filtro-select');
    const filtroInput = document.getElementById('filtro-input');

    params = `?${filtroSelect.value}=${encodeURIComponent(filtroInput.value.trim())}`;
    window.location.search = params;
    carregarTerapeutas();
}

async function carregarTerapeutas()
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/terapeutas${params}`, { credentials: 'include' });
        const terapeutas = await response.json();

        const mainSec = document.getElementById('main-sec');
        mainSec.innerHTML = '';

        for (const terapeuta of terapeutas)
        {
            let imagem = null;
            const imagemObj = terapeuta.usuario.imagem;

            if (imagemObj && imagemObj.data) 
            {
                const byteArray = new Uint8Array(imagemObj.data);
                const blob = new Blob([byteArray], { type: 'image/*' });
                imagem = URL.createObjectURL(blob);
            }

            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <img src="${imagem}" alt="Foto de perfil: ${terapeuta.usuario.nome}" style="width: 20%; height: auto; border-radius: 12px;"/>
                <div class="texts">
                    <div class="title">
                        <label><strong>${terapeuta.usuario.nome}</strong>
                        <span> | ${terapeuta.atendimentos.length || '00'} atendimentos realizados</span></label>
                    </div>
                    <div><p>Especialidade: ${terapeuta.especialidade || 'Sem especialidade registrada'}</p></div>
                    <div><p><i class="fa fa-star"></i> ${terapeuta.area || 'Sem áreas de atuação registradas'}</p></div>
                </div>
                <div class="btns">
                    <button class="atend" onclick="solicitarAgendamento(${terapeuta.usuario.id})">Solicitar atendimento</button> <br>
                    <button class="perf" onclick="verPerfil(${terapeuta.usuario.id})">Ver perfil</button>
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

let eventosPaginaAtual = 0;
let eventosTotais = [];

async function carregarEventos()
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/eventos`, { credentials: 'include' });
        eventosTotais  = await response.json();

        const eventosSec = document.getElementById('eventos-sec');
        eventosSec.innerHTML = '';

        const inicio = eventosPaginaAtual * 1;
        const fim = inicio + 1;
        const eventos = eventosTotais.slice(inicio, fim);

        const title = document.createElement('div');
        title.classList.add('events-title');
        title.innerHTML = `<h2>Eventos em destaque na OM</h2>`;

        eventosSec.appendChild(title);

        eventos.forEach((evento) =>
        {
            const byteArray = new Uint8Array(evento.imagem.data);
            let binary = '';
            for (let i = 0; i < byteArray.length; i++) binary += String.fromCharCode(byteArray[i]);
            const fotoBase64 = `data:image/jpeg;base64,${btoa(binary)}`;

            const date = new Date(evento.dia);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const dia = `${day}/${month}/${year} - ${hours}:${minutes}`;

            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <div class="foto">
                    <img src="${fotoBase64}" alt="Foto do evento" style="width: 100%; height: auto; border-radius: 12px;" />
                </div>
                <div class="texts">
                    <div><label><strong class="evento-dia">${dia}</strong></div>
                    <div><label><strong class="evento-nome">${evento.nome}</strong></div>
                    <div><label><strong class="evento-tipo">${evento.tipo}</strong></div>
                    <div><label><i class="fa fa-location-dot" style="color:gray;"></i><strong class="evento-local"> ${evento.local}</strong></div>
                    <div><a href="${evento.link}" target="_blank"><button class="eventos-det-btn" onclick="visualizarEvento(${evento.id})">VER DETALHES</button></a></div>
                </div>
            `;

            card.style.background = 'none';
            card.style.boxShadow  = 'none';

            eventosSec.appendChild(card);
        });

        const btnsPaginas = document.createElement('div');
        btnsPaginas.innerHTML = `<button id="eventos-anterior" class="eventos-nav-btn"> < </button> <button id="eventos-proximo" class="eventos-nav-btn"> > </button>`;
        eventosSec.appendChild(btnsPaginas);

        document.getElementById('eventos-anterior').addEventListener('click', () => 
        {
            if (eventosPaginaAtual > 0) 
            {
                eventosPaginaAtual--;
                carregarEventos();
            }
        });
        
        document.getElementById('eventos-proximo').addEventListener('click', () => 
        {
            if ((eventosPaginaAtual + 1) * 1 < eventosTotais.length) 
            {
                eventosPaginaAtual++;
                carregarEventos();
            }
        });
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

let terapeutaIdGlobal = null;

async function solicitarAgendamento(id)
{
    terapeutaIdGlobal = id;

    try 
    {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, { credentials: 'include' });
        const result = await response.json();
        const terapeuta = result.data;

        const modal = document.getElementById("modal-agendamento");
        modal.classList.remove("hidden");

        const horas = Math.floor(terapeuta.duracao_sessao / 60);
        const minutos = terapeuta.duracao_sessao % 60;
        tempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

        preco = (terapeuta.preco_sessao / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        document.getElementById("modal-nome").innerText = terapeuta.usuario.nome || 'Nome não disponível';
        document.getElementById("modal-tempo").innerText = `Sessão: ${tempo}`;
        document.getElementById("modal-preco").innerText = preco;
        document.getElementById("modal-descricao").innerHTML = terapeuta.bio || 'Descrição indisponível.';

        diasTotais = gerarDias(30);
        paginaAtual = 0;
        renderizarDias(id);
    } 
    catch (error) 
    {
        showToast("Erro ao carregar dados do terapeuta.", "error");
        console.error(error);
    }
}

let dataSelecionada = null;
let horaSelecionada = null; 

async function agendar() 
{
    const dia = getDataHoraParaSQL();
    if (!dia) 
    {
        showToast('Selecione a data e o horário.', 'error');
        return;
    }

    try 
    {
        const responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
        const dataUsuario = await responseUsuario.json();
        const cliente_id = dataUsuario.usuario.id;

        const responseAgendamento = await fetch(`${API_BASE_URL}/atendimentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                cliente_id,
                terapeuta_id: terapeutaIdGlobal,
                dia
            })
        });

        const resultAgendamento  = await responseAgendamento.json();

        if (!responseAgendamento.ok)
        {
            showToast(resultAgendamento.message, 'error');
            return;
        }

        showToast('Agendamento realizado com sucesso!', 'success');
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}

async function verPerfil(id)
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${id}`, { credentials: 'include' });
        const result = await response.json();
        const terapeuta = result.data;

        const modal = document.getElementById("modal-perfil");
        modal.classList.remove("hidden");

        const horas = Math.floor(terapeuta.duracao_sessao / 60);
        const minutos = terapeuta.duracao_sessao % 60;
        tempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

        preco = (terapeuta.preco_sessao / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        document.getElementById("modalP-nome").innerText = terapeuta.usuario.nome || 'Nome não disponível';
        document.getElementById("modalP-tempo").innerText = `Sessão: ${tempo}`;
        document.getElementById("modalP-preco").innerText = preco;
        document.getElementById("modalP-descricao").innerHTML = terapeuta.bio || 'Descrição indisponível.';

        renderizarAvaliacoes(id);
    } 
    catch (error) 
    {
        showToast("Erro ao carregar dados do terapeuta.", "error");
        console.error(error);
    }
}

function gerarDias(dias = 5) 
{
    const hoje = new Date();
    const diasGerados = [];

    for (let i = 0; i < dias; i++) {
        const data = new Date();
        data.setDate(hoje.getDate() + i);

        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
        const diaNumero = String(data.getDate()).padStart(2, '0');
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();

        diasGerados.push({
            dataCompleta: data,
            label: `${diaSemana} \n ${diaNumero} \n ${mes}`,
            iso: data.toISOString().split('T')[0]
        });
    }

    return diasGerados;
}

let paginaAtual = 0;
const DIAS_POR_PAGINA = 5;
let diasTotais = [];

function renderizarDias(terapeutaId) 
{
    const container = document.getElementById('dias-container');
    container.innerHTML = '';

    const inicio = paginaAtual * DIAS_POR_PAGINA;
    const fim = inicio + DIAS_POR_PAGINA;
    const dias = diasTotais.slice(inicio, fim);

    dias.forEach((dia, index) => 
    {
        const botao = document.createElement('button');
        botao.innerText = dia.label;
        botao.className = 'btn-dia';
        if (index === 0) botao.classList.add('ativo');

        botao.onclick = () => 
        {
            document.querySelectorAll('.btn-dia').forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            dataSelecionada = dia.iso;
            renderizarHorariosData(terapeutaId, dia.iso);
        };

        container.appendChild(botao);
    });

    renderizarHorariosData(terapeutaId, dias[0]?.iso);
}

async function renderizarHorariosData(terapeutaId, dataISO) 
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}`, { credentials: 'include' });
        const result = await response.json();
        const terapeuta = result.data;
        const { duracao_sessao, agenda } = terapeuta;

        const horarios = gerarHorariosPorDia(agenda, duracao_sessao, dataISO);
        const container = document.getElementById('horarios-container');
        container.innerHTML = '';

        if (horarios.length === 0) 
        {
            container.innerHTML = '<p>Sem horários disponíveis.</p>';
            return;
        }

        horarios.forEach(horario => 
        {
            const btn = document.createElement('button');
            btn.innerText = horario;
            btn.className = 'btn-horario';
            btn.onclick = () => 
            {
                document.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                horaSelecionada = horario;
            };
            container.appendChild(btn);
        });
    } 
    catch (err) 
    {
        showToast('Erro ao carregar horários.', 'error');
        console.error(err);
    }
}

function gerarHorariosPorDia(agenda, duracaoSessaoMinutos, dataISO) 
{
    const data = new Date(dataISO);

    const mapearDiaSemana = 
    {
        'domingo': 'domingo',
        'segunda-feira': 'segunda',
        'terça-feira': 'terca',
        'quarta-feira': 'quarta',
        'quinta-feira': 'quinta',
        'sexta-feira': 'sexta',
        'sábado': 'sabado'
    };

    const diaCompleto = data.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    const diaSemana = mapearDiaSemana[diaCompleto];

    const entradas = agenda.filter(a => a.dia.toLowerCase() === diaSemana);
    if (entradas.length === 0) return [];

    const horarios = [];

    for (const entrada of entradas) 
    {
        let inicio = horaParaMinutos(entrada.inicio);
        const fim = horaParaMinutos(entrada.fim);

        while (inicio + duracaoSessaoMinutos <= fim) 
        {
            horarios.push(minutosParaHora(inicio));
            inicio += duracaoSessaoMinutos;
        }
    }

    return horarios;
}

function horaParaMinutos(horaStr) 
{
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
}

function minutosParaHora(minutos) 
{
    const h = String(Math.floor(minutos / 60)).padStart(2, '0');
    const m = String(minutos % 60).padStart(2, '0');
    return `${h}:${m}`;
}

document.getElementById('btn-anterior').addEventListener('click', () => 
{
    if (paginaAtual > 0) 
    {
        paginaAtual--;
        renderizarDias(terapeutaIdGlobal);
    }
});

document.getElementById('btn-proximo').addEventListener('click', () => 
{
    if ((paginaAtual + 1) * DIAS_POR_PAGINA < diasTotais.length) 
    {
        paginaAtual++;
        renderizarDias(terapeutaIdGlobal);
    }
});

let avaliacoesPaginaAtual = 0;
const AVALIACOES_POR_PAGINA = 5;
let avaliacoesTotais;

async function renderizarAvaliacoes(terapeutaId) 
{
    terapeutaIdGlobal = terapeutaId;

    try 
    {
        const container = document.getElementById('avaliacoes-container');
        container.innerHTML = '';

        const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeutaId}`, { credentials: 'include' });
        const result = await response.json();
        const terapeuta = result.data;
        const atendimentos = terapeuta.atendimentos;

        avaliacoesTotais = atendimentos.filter(at => at.nota && at.comentario);

        if (avaliacoesTotais.length === 0) 
        {
            container.innerHTML = '<p>Nenhuma avaliação disponível.</p>';
            return;
        }

        const inicio = avaliacoesPaginaAtual * AVALIACOES_POR_PAGINA;
        const fim = inicio + AVALIACOES_POR_PAGINA;
        const avaliacoes = avaliacoesTotais.slice(inicio, fim);

        avaliacoes.forEach((atendimento, index) =>
        {
            const avaliacaoEl = document.createElement('div');
            avaliacaoEl.classList.add('avaliacao');

            //const estrelas = '★'.repeat(atendimento.nota) + '☆'.repeat(5 - atendimento.nota);
            const estrelas = gerarEstrelas(atendimento.nota);
            
            avaliacaoEl.innerHTML = `
                <div class="avaliacao-header">
                    <span class="estrelas">${estrelas}</span>
                </div>
                <p class="comentario">"${atendimento.comentario}"</p>
            `;

            container.appendChild(avaliacaoEl);
        });
    } 
    catch (error) 
    {
        showToast("Erro ao carregar avaliações.", "error");
        console.error(error);
    }
}

function gerarEstrelas(nota) 
{
    const notaLimite = Math.min(Math.max(nota, 0), 5);
    let estrelasHTML = '';

    for (let i = 1; i <= 5; i++) 
    {
        if (i <= notaLimite) estrelasHTML += '<i class="fa-solid fa-star"></i>';
        else estrelasHTML += '<i class="fa-regular fa-star" style="color: #CCC;"></i>';
    }

    return estrelasHTML;
}

document.getElementById('aval-anterior').addEventListener('click', () => 
{
    if (avaliacoesPaginaAtual > 0) 
    {
        avaliacoesPaginaAtual--;
        renderizarAvaliacoes(terapeutaIdGlobal);
    }
});

document.getElementById('aval-proximo').addEventListener('click', () => 
{
    if ((avaliacoesPaginaAtual + 1) * AVALIACOES_POR_PAGINA < avaliacoesTotais.length) 
    {
        avaliacoesPaginaAtual++;
        renderizarAvaliacoes(terapeutaIdGlobal);
    }
});

function getDataHoraParaSQL() 
{
    if (!dataSelecionada || !horaSelecionada) return null;
    return `${dataSelecionada} ${horaSelecionada}:00`;
}