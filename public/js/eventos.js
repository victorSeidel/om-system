let responseUsuario;
let dataUsuario;
let usuario;
let usuario_id;

document.addEventListener('DOMContentLoaded', async function() 
{
    carregarEventos();

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

async function carregarEventos()
{
    try 
    {
        const response = await fetch(`${API_BASE_URL}/eventos`, { credentials: 'include' });
        const eventos = await response.json();
        
        if (!eventos || eventos == null || eventos.length == 0) return;

        const mainSec = document.getElementById('main-sec');
        mainSec.innerHTML = '';

        for (const evento of eventos)
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
                <img src="${fotoBase64}" alt="Foto do evento" style="width: 200px; height: auto; border-radius: 12px;"/>
                <div class="texts">
                    <label><strong class="title">${evento.nome}</strong>          (${evento.tipo || 'Não foi possível carregar'})</label>
                    <div><label><strong class="dia">${dia}</strong></div>
                    <div><p>${evento.detalhes || 'Não foi possível carregar os detalhes'}</p></div>
                    <div><p><strong>Local: </strong>${evento.local || 'Não foi possível carregar o local'}</p></div>
                </div>
                <div class="btns">
                    <a href="${evento.link}" target="_blank"><button class="atend-btn" onclick="">Inscreva-se</button></a>
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