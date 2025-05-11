const codigoCache = new Map();

function salvarCodigo(email, codigo) 
{
    codigoCache.set(email, codigo);

    setTimeout(() => { codigoCache.delete(email); }, 5 * 60 * 1000);
}

function verificarCodigo(email, codigoDigitado) 
{
    const codigoCorreto = codigoCache.get(email);
    return codigoCorreto === codigoDigitado;
}

module.exports = { salvarCodigo, verificarCodigo };