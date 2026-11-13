const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const peminjamanController = require("../controllers/peminjamanController");

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

router.get(
  "/",
  hanya("admin", "petugas", "peminjam"),
  peminjamanController.list,
);
router.get("/:id", hanya("admin", "petugas", "peminjam"), peminjamanController.detail);
router.post("/", hanya("admin", "peminjam"), peminjamanController.create);
router.put("/:id", hanya("admin"), peminjamanController.update);
router.delete("/:id", hanya("admin"), peminjamanController.remove);
router.patch(
  "/:id/status",
  hanya("petugas"),
  peminjamanController.updateStatus,
);

module.exports = router;
