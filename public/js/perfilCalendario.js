document.addEventListener('DOMContentLoaded', async function() 
{
    try 
    {
        response = await fetch(`${API_BASE_URL}/terapeutas/${-1}`, { credentials: 'include' });
        result = await response.json();
        terapeuta = result.data;

        if (result.success && terapeuta) 
        {
            const horarios = terapeuta.agenda || [
                { dia: 'domingo', inicio: '00:00', fim: '00:00' },
                { dia: 'segunda', inicio: '00:00', fim: '00:00' },
                { dia: 'terca', inicio: '00:00', fim: '00:00' },
                { dia: 'quarta', inicio: '00:00', fim: '00:00' },
                { dia: 'quinta', inicio: '00:00', fim: '00:00' },
                { dia: 'sexta', inicio: '00:00', fim: '00:00' },
                { dia: 'sabado', inicio: '00:00', fim: '00:00' }
            ];

            horarios.forEach(horario => 
            {
                const dia = horario.dia;
                const inicio = horario.inicio;
                const fim = horario.fim;

                const diaHorario = document.querySelector(`.dia-horario[data-dia="${dia}"]`);
                if (diaHorario) 
                {
                    const inputs = diaHorario.querySelectorAll('input');
                    inputs[0].value = inicio;
                    inputs[1].value = fim;
                }
            });
        }
    } 
    catch (error) 
    {
        showToast(error, 'error');
        console.log(error);
    }
});

async function salvarHorarios()
{
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const horarios = [];

    document.querySelectorAll('.dia-horario').forEach((el, i) => 
    {
        const inputs = el.querySelectorAll('input');
        const inicio = inputs[0].value;
        const fim = inputs[1].value;

        if (inicio && fim) { horarios.push({ dia: dias[i], inicio, fim }); }
    });

    const response = await fetch(`${API_BASE_URL}/terapeutas/${terapeuta.usuario_id}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horarios} ),
        credentials: 'include'
    });

    if (!response.ok) 
    {
        showToast('', 'error');
        return;
    } 

    showToast('Horários salvos com sucesso!');
    setTimeout(() => window.location.reload(), 500);
}

function showToast(message, type = 'success') 
{
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}