import React, { useState, useEffect } from "react";
import "../AdminStyles/UpdateProduct.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import { removeSuccess, updateProduct } from "../features/admin/adminSlice";
import { toast } from "react-toastify";

function UpdateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, products } = useSelector((state) => state.admin);
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [variants, setVariants] = useState([{ label: "", size: "", color: "", price: "", stock: "" }]);
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [oldImages, setOldImages] = useState([]);

  useEffect(() => {
    dispatch(removeSuccess());
  }, [dispatch]);

  useEffect(() => {
    const product = products.find((p) => p._id === id);
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setDescription(product.description || "");
      setKeywords(product.keywords || "");
      setStock(product.stock || "");
      setCategory(product.category || "");
      setVariants(product.variants?.length ? product.variants.map((variant) => ({
        _id: variant._id,
        label: variant.label || "",
        size: variant.size || "",
        color: variant.color || "",
        price: variant.price || "",
        stock: variant.stock || "",
      })) : [{ label: "", size: "", color: "", price: "", stock: "" }]);
      setOldImages(product.image || []);
    }
  }, [id, products]);

  const updateVariantField = (index, field, value) => {
    setVariants((current) => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  const addVariantRow = () => {
    setVariants((current) => [...current, { label: "", size: "", color: "", price: "", stock: "" }]);
  };

  const removeVariantRow = (index) => {
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImage([]);
    setImagePreview([]);
    setOldImages([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview((old) => [...old, reader.result]);
          setImage((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      price,
      description,
      keywords,
      stock,
      category,
      variants: variants.filter((variant) => variant.price || variant.stock || variant.size || variant.color || variant.label),
    };

    if (image.length > 0) {
      payload.image = image;
    }

    try {
      await dispatch(updateProduct({ id, formData: payload })).unwrap();
      toast.success(t("admin.products.updated"), { position: "top-center", autoClose: 2500 });
      navigate("/admin/products");
    } catch {
      toast.error(t("admin.products.updateFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <PageTitle title={t("admin.products.updateProduct")} />

      <div className="update-product-wrapper">
        <h1 className="update-product-title">{t("admin.products.updateProduct")}</h1>
        <form className="update-product-form" onSubmit={handleProductSubmit}>
          <div className="update-product-fields">
            <label htmlFor="name">{t("admin.products.productName")}</label>
            <input type="text" className="update-product-input" required id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor="price">{t("admin.products.productPrice")}</label>
            <input type="number" className="update-product-input" required id="price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} />

            <label htmlFor="description">{t("admin.products.productDescription")}</label>
            <textarea className="update-product-textarea" required id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <label htmlFor="keywords">{t("admin.products.productKeywords")}</label>
            <input type="text" className="update-product-input" id="keywords" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />

            <label htmlFor="category">Category</label>
            <input type="text" className="update-product-input" id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} />

            <label htmlFor="stock">{t("admin.products.productStock")}</label>
            <input type="number" className="update-product-input" required id="stock" name="stock" value={stock} onChange={(e) => setStock(e.target.value)} />

            <div className="variant-editor">
              <h3>Variants</h3>
              {variants.map((variant, index) => (
                <div key={variant._id || index} className="variant-row">
                  <input type="text" className="update-product-input" placeholder="Label" value={variant.label} onChange={(e) => updateVariantField(index, "label", e.target.value)} />
                  <input type="text" className="update-product-input" placeholder="Size" value={variant.size} onChange={(e) => updateVariantField(index, "size", e.target.value)} />
                  <input type="text" className="update-product-input" placeholder="Color" value={variant.color} onChange={(e) => updateVariantField(index, "color", e.target.value)} />
                  <input type="number" className="update-product-input" placeholder="Variant price" value={variant.price} onChange={(e) => updateVariantField(index, "price", e.target.value)} />
                  <input type="number" className="update-product-input" placeholder="Variant stock" value={variant.stock} onChange={(e) => updateVariantField(index, "stock", e.target.value)} />
                  {variants.length > 1 ? <button type="button" className="update-product-submit-btn" onClick={() => removeVariantRow(index)}>Remove</button> : null}
                </div>
              ))}
              <button type="button" className="update-product-submit-btn" onClick={addVariantRow}>Add variant</button>
            </div>

            <div className="file-input-wrapper">
              <input type="file" id="update-product-images" accept="image/*" multiple onChange={handleImageChange} />
              <label htmlFor="update-product-images" className="file-input-label">{t("admin.products.chooseImages")}</label>
            </div>

            {imagePreview.length > 0 && (
              <div className="update-product-preview-wrapper">
                {imagePreview.map((img, index) => (
                  <img src={img} key={index} alt={t("admin.products.newPreview")} className="update-product-preview-image" />
                ))}
              </div>
            )}

            {oldImages.length > 0 && (
              <div className="update-product-old-images-wrapper">
                {oldImages.map((img, index) => (
                  <img src={img.url} key={index} alt={t("admin.products.oldImage")} className="update-product-old-image" />
                ))}
              </div>
            )}

            <button className="update-product-submit-btn">{t("common.update")}</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default UpdateProduct;
