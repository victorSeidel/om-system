const API_BASE_URL = "https://om-system-production.up.railway.app/api";

window.addEventListener('unload', function () { navigator.sendBeacon('/logout'); });

function showToast(message, type = 'success') 
{
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
