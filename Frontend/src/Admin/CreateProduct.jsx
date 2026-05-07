import React, { useEffect, useState } from "react";
import "../AdminStyles/CreateProduct.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { removeErrors, createProduct } from "../features/admin/adminSlice";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

function CreateProduct() {
  const { loading, error } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setDescription("");
    setKeywords("");
    setCategory("");
    setVariants([{ label: "", size: "", color: "", price: "", stock: "" }]);
    setImage([]);
    setImagePreview([]);
  };

  const createProductSubmit = async (e) => {
    e.preventDefault();
    const activeVariants = variants.filter((variant) => variant.price || variant.stock || variant.size || variant.color || variant.label);

    try {
      await dispatch(createProduct({ name, price, description, keywords, stock, category, image, variants: activeVariants })).unwrap();
      toast.success(t("admin.products.created"), { position: "top-center", autoClose: 3000 });
      resetForm();
      navigate("/admin/products");
    } catch (submitError) {
      toast.error(submitError || t("admin.products.createFailed"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  };

  const createProductImage = (e) => {
    const files = Array.from(e.target.files);
    setImage([]);
    setImagePreview([]);

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

  useEffect(() => {
    if (error) {
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <PageTitle title={t("admin.products.createProduct")} />
      <div className="create-product-container">
        <h1 className="form-title">{t("admin.products.createProduct")}</h1>
        <form className="procuct-form" encType="multipart/form-data" onSubmit={createProductSubmit}>
          <input type="text" className="form-input" name="name" placeholder={t("admin.products.enterName")} required value={name} onChange={(e) => setName(e.target.value)} />
          <input type="number" className="form-input" name="price" placeholder={t("admin.products.enterPrice")} required value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="text" className="form-input" name="description" placeholder={t("admin.products.enterDescription")} required value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="text" className="form-input" name="keywords" placeholder={t("admin.products.productKeywords")} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <input type="text" className="form-input" name="category" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input type="number" className="form-input" name="stock" placeholder={t("admin.products.enterStock")} required value={stock} onChange={(e) => setStock(e.target.value)} />

          <div className="variant-editor">
            <h3>Variants</h3>
            {variants.map((variant, index) => (
              <div key={index} className="variant-row">
                <input type="text" className="form-input" placeholder="Label" value={variant.label} onChange={(e) => updateVariantField(index, "label", e.target.value)} />
                <input type="text" className="form-input" placeholder="Size" value={variant.size} onChange={(e) => updateVariantField(index, "size", e.target.value)} />
                <input type="text" className="form-input" placeholder="Color" value={variant.color} onChange={(e) => updateVariantField(index, "color", e.target.value)} />
                <input type="number" className="form-input" placeholder="Variant price" value={variant.price} onChange={(e) => updateVariantField(index, "price", e.target.value)} />
                <input type="number" className="form-input" placeholder="Variant stock" value={variant.stock} onChange={(e) => updateVariantField(index, "stock", e.target.value)} />
                {variants.length > 1 ? <button type="button" className="submit-btn" onClick={() => removeVariantRow(index)}>Remove</button> : null}
              </div>
            ))}
            <button type="button" className="submit-btn" onClick={addVariantRow}>Add variant</button>
          </div>

          <div className="file-input-container">
            <div className="file-input-wrapper">
              <input type="file" id="create-product-images" name="image" accept="image/*" className="form-input-file" multiple onChange={createProductImage} />
              <label htmlFor="create-product-images" className="file-input-label">{t("admin.products.chooseImages")}</label>
            </div>
          </div>

          <div className="image-preview-container">
            {imagePreview.map((img, index) => (
              <img src={img} alt={t("admin.products.preview")} className="image-preview" key={index} />
            ))}
          </div>

          <button type="submit" className="submit-btn">{loading ? t("common.loading") : t("common.create")}</button>
        </form>
      </div>
    </>
  );
}

export default CreateProduct;
