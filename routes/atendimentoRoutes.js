const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

router.post('/', atendimentoController.create);
router.get('/', atendimentoController.list);
router.get('/terapeutas/:terapeuta_id', atendimentoController.listByTerapeutaId);
router.get('/clientes/:cliente_id', atendimentoController.listByClienteId);
router.get('/:id', atendimentoController.getById);
router.put('/:id', atendimentoController.update);
router.delete('/:id', atendimentoController.delete);

module.exports = router;