const express = require('express');
const router = express.Router();
const terapeutaController = require('../controllers/terapeutaController');

router.post('/', terapeutaController.create);
router.get('/', terapeutaController.list);
router.get('/:id', terapeutaController.getById);
router.put('/:id', terapeutaController.update);
router.delete('/:id', terapeutaController.delete);
router.post('/:terapeuta_id/banco', terapeutaController.setBank);
router.post('/:terapeuta_id/agenda', terapeutaController.setAgenda);

module.exports = router;