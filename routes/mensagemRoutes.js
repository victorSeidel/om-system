const express = require('express');
const router = express.Router();
const mensagemController = require('../controllers/mensagemController');

router.post('/', mensagemController.create);
router.get('/:remetente_id/:destinatario_id', mensagemController.list);

module.exports = router;