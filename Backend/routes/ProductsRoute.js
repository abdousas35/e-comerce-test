import express from "express";
import { createProducts,  getAllProducts, updateProduct, deleteProduct, accessingSingleProduct, getAdminProducts, createRiviewForProduct, getProductReviews, deleteProductReview, importProductsFromCsv} from "../controller/ProductController.js";
import catchAsyncErrors from "../middleware/HandleAsyncError.js"
import { verifyUserAuth, roleBasedAccess} from "../middleware/userAuth.js";


const router = express.Router();


router.route("/products").get(catchAsyncErrors(getAllProducts));


router.route("/admin/product/create").post(verifyUserAuth, roleBasedAccess("admin"), catchAsyncErrors(createProducts));


router.route("/admin/product/:id")
.put(verifyUserAuth, roleBasedAccess("admin"), catchAsyncErrors(updateProduct))
.delete(verifyUserAuth, roleBasedAccess("admin"), catchAsyncErrors(deleteProduct));


router.route("/admin/products").get(verifyUserAuth, roleBasedAccess("admin"), catchAsyncErrors(getAdminProducts));
router.route("/admin/products/import-csv").post(verifyUserAuth, roleBasedAccess("admin"), catchAsyncErrors(importProductsFromCsv));


router.route("/product/:id").get(accessingSingleProduct);
router.route("/review").post(verifyUserAuth, createRiviewForProduct);
router.route("/reviews").get(getProductReviews);
router.route("/admin/deleteReview").delete(verifyUserAuth, roleBasedAccess("admin"), deleteProductReview);

export default router;
