let responseUsuario;
let dataUsuario;
let cliente_id;
let terapeuta_id;

document.addEventListener('DOMContentLoaded', async function() 
{
    responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
    dataUsuario = await responseUsuario.json();
    cliente_id = dataUsuario.usuario.id;

    carregarAgendamentos();

    document.getElementById('modal-chat').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
    document.getElementById('modal-aval').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
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

async function carregarAgendamentos()
{
    try 
    {
        const responseUsuario = await fetch('/api/status', { method: 'GET', credentials: 'include' });
        const dataUsuario = await responseUsuario.json();
        const cliente_id = dataUsuario.usuario.id;

        const response = await fetch(`${API_BASE_URL}/atendimentos/clientes/${cliente_id}`, { credentials: 'include' });
        const result = await response.json();
        const atendimentos = result.data;
        
        if (!atendimentos || atendimentos == null || atendimentos.length == 0) return;

        const mainSec = document.getElementById('main-sec');
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
                    <label><strong>${atendimento.terapeuta.usuario.nome}</strong></label>
                    <button class="chat-btn" onclick="abrirChat('${atendimento.terapeuta.usuario.nome}', ${atendimento.terapeuta.usuario.id})">CHAT</button>
                </div>
                <div class="texts">
                    <div><label><strong class="title">${dia}</strong></div>
                    <div><p><strong>Tempo de sessão: </strong> ${tempo || 'Não foi possível carregar'}</p></div>
                    <div><p><strong>Valor da sessão: </strong> ${preco || 'Não foi possível carregar'}</p></div>
                    <div><p><strong>Especialidade: </strong> ${atendimento.terapeuta.especialidade || 'Sem especialidade registrada'}</p></div>
                </div>
                <div class="btns">
                    ${!atendimento.iniciado ? `<button class="atend-btn" onclick="iniciarAtendimento(${atendimento.id})">Iniciar atendimento</button> <br>` 
                    : !atendimento.finalizado_cliente ? `<button class="atend-btn" onclick="concluirAtendimento(${atendimento.id})">Concluir atendimento</button><br>` : ''}
                    ${atendimento.finalizado && !atendimento.nota ? `<button class="atend-btn" onclick="abrirAvaliacao(${atendimento.id})">Avaliar atendimento</button> <br>` : ''}
                    ${!atendimento.iniciado ? '<button class="reagendar-btn" onclick="">Reagendar</button> <br>' : ''}
                    ${!atendimento.iniciado ? '<button class="cancel-btn" onclick="">Cancelar</button> <br>' : ''}
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
        const response = await fetch(`${API_BASE_URL}/mensagens/${cliente_id}/${terapeuta_id}`, { credentials: 'include' });
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
    terapeuta_id = id;

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
            body: JSON.stringify({ remetente_id: cliente_id, destinatario_id: terapeuta_id, mensagem }),
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

async function iniciarAtendimento(id) 
{
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iniciado: true }),
        credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    showToast('Atendimento iniciado com sucesso!');
    carregarAgendamentos();
}

async function concluirAtendimento(id) 
{
    const response = await fetch(`${API_BASE_URL}/atendimentos/${id}`, 
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizado_cliente: true }),
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

async function abrirAvaliacao(atendimentoId) 
{
    document.getElementById("aval-btn").onclick = () => { enviarAvaliacao(atendimentoId); };

    const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}`, { headers: { 'Content-Type': 'application/json' }, credentials: 'include' });

    const result = await response.json();

    if (!response.ok)
    {
        showToast(result.message, 'error');
        return;
    }

    document.getElementById("aval-nota").value = result.data.nota;
    document.getElementById("aval-coment").value = result.data.comentario;

    const modal = document.getElementById("modal-aval");
    modal.classList.remove("hidden");
}

async function enviarAvaliacao(atendimentoId) 
{
    try 
    {
        const nota = document.getElementById("aval-nota").value;
        const comentario = document.getElementById("aval-coment").value;
    
        const response = await fetch(`${API_BASE_URL}/atendimentos/${atendimentoId}`, 
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nota, comentario }),
            credentials: 'include'
        });
    
        const result = await response.json();
    
        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }
    
        document.getElementById("aval-nota").value = '';
        document.getElementById("aval-coment").value = '';
        document.getElementById('modal-aval').classList.add('hidden');
    } 
    catch (error) 
    {
        showToast(error.message, 'error');
        console.log(error);
    }
}