const express = require("express");
const tableController = require("../controllers/tableController");
const router = express.Router();

router
  .route("/")
  .get(tableController.getAllTables)
  .post(tableController.createTable);

router
  .route("/:id")
  .get(tableController.getTable)
  .put(tableController.updateTable)
  .delete(tableController.deleteTable);

// Ruta para cambiar el estado de la mesa
router.patch("/:id/state", tableController.changeTableState);

// Ruta para asignar/transferir mesa entre meseros (solo supervisor)
router.patch("/:id/assign", tableController.assignOrTransferTable);

module.exports = router;
