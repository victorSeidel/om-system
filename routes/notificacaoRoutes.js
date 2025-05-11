const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');

router.post('/', notificacaoController.create);
router.get('/:terapeuta_id', notificacaoController.list);
router.delete('/:id', notificacaoController.delete);

module.exports = router;