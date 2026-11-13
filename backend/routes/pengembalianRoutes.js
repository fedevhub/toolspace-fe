const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/pengembalianController");

const router = express.Router();

const hanya =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses ke fitur ini." });
    }
    return next();
  };

router.use(authMiddleware);

// Petugas & admin: daftar peminjaman disetujui + status pengembaliannya
router.get("/monitor", hanya("admin", "petugas"), controller.monitor);

// Peminjam: mengajukan pengembalian
router.get("/milik-saya", hanya("peminjam"), controller.milikSaya);
router.post("/ajukan", hanya("peminjam"), controller.ajukan);

// Petugas: memproses pengembalian
router.post(
  "/petugas/:peminjamanId/setujui",
  hanya("petugas"),
  controller.setujui,
);
router.post("/petugas/:peminjamanId/tolak", hanya("petugas"), controller.tolak);

// Admin
router.get("/", hanya("admin"), controller.list);
router.post("/", hanya("admin"), controller.create);
router.delete("/:id", hanya("admin"), controller.remove);

module.exports = router;
