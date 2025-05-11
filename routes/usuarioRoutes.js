const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

const upload = require('../config/upload');

router.post('/', usuarioController.create);
router.get('/', usuarioController.list);
router.get('/:id', usuarioController.getById);
router.post('/login', usuarioController.login);
router.put('/:id', upload.single('imagem'), usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;