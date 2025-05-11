const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo');

const titulo = document.getElementById('title');
const textoAlt = document.getElementById('subtitle');

document.addEventListener('DOMContentLoaded', async function() 
{
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').addEventListener('click', (event) => { if (event.target === event.currentTarget) { event.currentTarget.classList.add('hidden'); } });
});

if (titulo && textoAlt)
{
    if (tipo === 'cliente') 
    {
        titulo.textContent = "Cadastre-se como cliente";
        textoAlt.innerHTML = 'Está buscando trabalho? <a href="/cadastro?tipo=terapeuta">Cadastre-se como terapeuta.</a>';
    } 
    else 
    {
        titulo.textContent = "Cadastre-se como terapeuta";
        textoAlt.innerHTML = 'Quer ser atendida? <a href="/cadastro?tipo=cliente">Cadastre-se como cliente.</a>';
    }
}

async function solicitarCodigo(email) 
{
    showToast('Enviando...');
    try 
    {
        const response = await fetch('/enviar-codigo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (!response.ok)
        {
            showToast(result.message, 'error');
        }

        showToast('Código enviado com sucesso!');
    } 
    catch (error) {
        showToast(error, 'error');
    }
}

async function verificarCodigo(email) 
{
    const codigo = document.getElementById('codigo-digitado').value;

    const response = await fetch('/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
    });

    const result = await response.json();
    if (response.ok) 
    {
        showToast('Sucesso!');
        return true;
    } 
    else 
    {
        showToast(result.message, 'error');
        return false;
    }
}

async function abrirModalVerificacao(email)
{
    return new Promise((resolve) => 
    {
        const modal = document.getElementById('modal');
        modal.classList.remove('hidden');

        const btn = document.getElementById('verificar-codigo-btn');

        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);

        clone.addEventListener('click', async function () {
            const resultado = await verificarCodigo(email);
            if (resultado) {
                modal.classList.add('hidden');
            }
            resolve(resultado);
        });
    });
}

async function cadastrar(event)
{
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('tel').value;
    const senha = document.getElementById('senha').value;
    const conSenha = document.getElementById('conSenha').value;

    if (senha.value != conSenha.value) { showToast('Senhas não conferem.', 'error'); return; }

    const data = { nome, email, telefone, senha, tipo }
    let usuario_id;

    await solicitarCodigo(email);
    const codigoResult = await abrirModalVerificacao(email);

    if (!codigoResult) return;

    try 
    {
        const response = await fetch(`${API_BASE_URL}/usuarios`, 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        const result  = await response.json();
        const usuario = result.data;

        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }

        usuario_id = usuario.id;

        if (tipo == 'terapeuta')
        {
            const responseTer = await fetch(`${API_BASE_URL}/terapeutas`, 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario_id })
            });
    
            const resultTer = await responseTer.json();
    
            if (!responseTer.ok)
            {
                const responseDel = await fetch(`${API_BASE_URL}/usuarios/${usuario_id}`, { method: 'DELETE'});
                showToast(resultTer.message, 'error');
                return;
            }
        }

        showToast('Sucesso! Redirecionando...');

        setTimeout(() => window.location.href = '/login', 1000);
    } 
    catch (error) 
    {
        showToast(error, 'error');
    }
}

async function entrar(event)
{
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try 
    {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
            credentials: 'include'
        });

        const result = await response.json();
        const usuario = result.data;

        if (!response.ok)
        {
            showToast(result.message, 'error');
            return;
        }

        showToast('Sucesso! Redirecionando...');
      
        setTimeout(() => window.location.href = `/?tipo=${usuario.tipo}`, 1000);
    } 
    catch (error) 
    {
        showToast(error, 'error');
    }
}

function showToast(message, type = 'success') 
{
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}