const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

const upload = require('../config/upload');

router.post('/', upload.single('imagem'), eventoController.create);
router.get('/', eventoController.list);
router.get('/terapeuta/:terapeuta_id', eventoController.listByTerapeutaId);
router.get('/:id', eventoController.getById);
router.put('/:id', eventoController.update);
router.delete('/:id', eventoController.delete);

module.exports = router;