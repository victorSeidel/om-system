const jwt = require('jsonwebtoken');

function autenticar(req, res, next) 
{
  const token = req.cookies.token;

  if (!token) { return res.redirect('/login'); }

  try 
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } 
  catch (err) 
  {
    return res.redirect('/login');
  }
}

module.exports = autenticar;