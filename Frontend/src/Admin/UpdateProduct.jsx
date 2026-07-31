import React, { useState, useEffect } from "react";
import "../AdminStyles/CreateProduct.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Loader from "../components/Loader";
import { removeSuccess, updateProduct } from "../features/admin/adminSlice";
import { toast } from "react-toastify";
import GoToDashboard from "../components/GoToDashboard";
import imageCompression from "browser-image-compression";

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyOption = () => ({
  id: generateId(),
  value: "",
  price: "",
  stock: "",
  images: [],
});

const createEmptyGroup = () => ({
  id: generateId(),
  name: "",
  options: [createEmptyOption()],
});

const mapProductOptionGroups = (optionGroups = []) =>
  optionGroups.map((group) => ({
    id: group._id || generateId(),
    name: group.name || "",
    options: (group.options || []).map((option) => ({
      id: option._id || generateId(),
      value: option.value || "",
      price: option.price ?? "",
      stock: option.stock ?? "",
      images: option.images || [],
    })),
  }));

function UpdateProduct() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { loading, products } = useSelector((state) => state.admin);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(removeSuccess());
  }, [dispatch]);

  const product = products.find((p) => p._id === id);

  if (loading || !product) return <Loader />;

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.products.updateProduct")} />
      {/* Keying by product._id forces a fresh mount (and fresh initial state)
          whenever the admin navigates to edit a different product. */}
      <UpdateProductForm key={product._id} product={product} />
    </>
  );
}

function UpdateProductForm({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price || "");
  const [description, setDescription] = useState(product.description || "");
  const [keywords, setKeywords] = useState(product.keywords || "");
  const [stock, setStock] = useState(product.stock || "");
  const [lowStock, setLowStock] = useState(product.lowStock || 3);
  const [category, setCategory] = useState(product.category || "");
  const [discount, setDiscount] = useState(product.discount || 0);
  const [optionGroups, setOptionGroups] = useState(() => mapProductOptionGroups(product.optionGroups));
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [oldImages, setOldImages] = useState(product.image || []);

  const compressFilesToBase64 = async (files) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    const results = [];
    for (const file of files) {
      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
      results.push(base64);
    }
    return results;
  };

  // ---- Option group helpers ----

  const addGroup = () => {
    setOptionGroups((current) => [...current, createEmptyGroup()]);
  };

  const removeGroup = (groupId) => {
    setOptionGroups((current) => current.filter((group) => group.id !== groupId));
  };

  const updateGroupName = (groupId, newName) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, name: newName } : group
    )));
  };

  const addOption = (groupId) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, options: [...group.options, createEmptyOption()] } : group
    )));
  };

  const removeOption = (groupId, optionId) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId
        ? { ...group, options: group.options.filter((option) => option.id !== optionId) }
        : group
    )));
  };

  const updateOptionField = (groupId, optionId, field, value) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId
        ? {
            ...group,
            options: group.options.map((option) => (
              option.id === optionId ? { ...option, [field]: value } : option
            )),
          }
        : group
    )));
  };

  const handleOptionImages = async (groupId, optionId, files) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;
    try {
      const processedImages = await compressFilesToBase64(fileList);
      updateOptionField(groupId, optionId, "images", processedImages);
    } catch {
      toast.error(t("user.updateProfile.avatarProcessFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  const updateProductImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImage([]);
    setImagePreview([]);
    setOldImages([]);

    try {
      const processedImages = await compressFilesToBase64(files);
      setImage(processedImages);
      setImagePreview(processedImages);
    } catch {
      toast.error(t("user.updateProfile.avatarProcessFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  const updateProductSubmit = async (e) => {
    e.preventDefault();

    const cleanedOptionGroups = optionGroups
      .filter((group) => group.name.trim() !== "")
      .map((group) => ({
        name: group.name.trim(),
        options: group.options
          .filter((option) => option.value || option.price || option.stock || option.images.length > 0)
          .map((option) => ({
            value: option.value,
            price: option.price,
            stock: option.stock,
            images: option.images,
          })),
      }))
      .filter((group) => group.options.length > 0);

    const payload = {
      name,
      price,
      description,
      keywords,
      stock,
      lowStock,
      category,
      discount,
      optionGroups: cleanedOptionGroups,
    };

    if (image.length > 0) {
      payload.image = image;
    }

    try {
      await dispatch(updateProduct({ id: product._id, formData: payload })).unwrap();
      toast.success(t("admin.products.updated"), { position: "top-center", autoClose: 2500 });
      navigate("/admin/products");
    } catch {
      toast.error(t("admin.products.updateFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  return (
    <div className="create-product-container">
      <h1 className="form-title">{t("admin.products.updateProduct")}</h1>
      <form className="product-form" onSubmit={updateProductSubmit}>
        <input type="text" className="form-input" required id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.products.enterName")} />
        <input type="number" className="form-input" required id="price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("admin.products.enterPrice")} />
        <input type="number" className="form-input" id="discount" name="discount" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder={t("admin.products.discountAmount")} />
        <input type="text" className="form-input" required id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("admin.products.enterDescription")} />
        <input type="text" className="form-input" id="keywords" name="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t("admin.products.productKeywords")} />
        <input type="text" className="form-input" id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("admin.products.category")} />
        <input type="number" className="form-input" required id="stock" name="stock" value={stock} onChange={(e) => setStock(e.target.value)} placeholder={t("admin.products.enterStock")} />
        <input type="number" className="form-input" required id="lowStock" name="lowStock" value={lowStock} onChange={(e) => setLowStock(e.target.value)} placeholder={t("admin.products.lowStockThreshold")} />

        <div className="variant-editor">
          <h3>{t("admin.products.optionGroups")}</h3>

          {optionGroups.map((group) => (
            <div key={group.id} className="option-group-card">
              <div className="option-group-header">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("admin.products.groupNamePlaceholder")}
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                />
                <button type="button" className="submit-btn" onClick={() => removeGroup(group.id)}>
                  {t("admin.products.removeGroup")}
                </button>
              </div>

              {group.options.map((option) => (
                <div key={option.id} className="variant-row option-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={group.name ? group.name : t("admin.products.optionValuePlaceholder")}
                    value={option.value}
                    onChange={(e) => updateOptionField(group.id, option.id, "value", e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder={t("admin.products.variantPrice")}
                    value={option.price}
                    onChange={(e) => updateOptionField(group.id, option.id, "price", e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder={t("admin.products.variantStock")}
                    value={option.stock}
                    onChange={(e) => updateOptionField(group.id, option.id, "stock", e.target.value)}
                  />

                  <div className="file-input-container option-image-input">
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id={`update-option-images-${option.id}`}
                        accept="image/*"
                        className="form-input-file"
                        multiple
                        onChange={(e) => handleOptionImages(group.id, option.id, e.target.files)}
                      />
                      <label htmlFor={`update-option-images-${option.id}`} className="file-input-label">
                        {t("admin.products.chooseImages")}
                      </label>
                    </div>
                    {option.images.length > 0 && (
                      <div className="image-preview-container">
                        {option.images.map((img, index) => (
                          <img
                            src={typeof img === "string" ? img : img.url}
                            alt={t("admin.products.preview")}
                            className="image-preview"
                            key={index}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {group.options.length > 1 ? (
                    <button type="button" className="submit-btn" onClick={() => removeOption(group.id, option.id)}>
                      {t("admin.products.removeVariant")}
                    </button>
                  ) : null}
                </div>
              ))}

              <button type="button" className="submit-btn" onClick={() => addOption(group.id)}>
                {t("admin.products.addOption")}
              </button>
            </div>
          ))}

          <button type="button" className="submit-btn" onClick={addGroup}>
            {t("admin.products.addGroup")}
          </button>
        </div>

        <div className="file-input-container">
          <div className="file-input-wrapper">
            <input type="file" id="update-product-images" accept="image/*" multiple onChange={updateProductImage} className="form-input-file" />
            <label htmlFor="update-product-images" className="file-input-label">{t("admin.products.chooseImages")}</label>
          </div>
        </div>

        <div className="image-preview-container">
          {imagePreview.map((img, index) => (
            <img src={img} key={index} alt={t("admin.products.newPreview")} className="image-preview" />
          ))}
          {oldImages.map((img, index) => (
            <img src={img.url} key={index} alt={t("admin.products.oldImage")} className="image-preview" />
          ))}
        </div>

        <button type="submit" className="submit-btn">{t("common.update")}</button>
      </form>
    </div>
  );
}

export default UpdateProduct;
