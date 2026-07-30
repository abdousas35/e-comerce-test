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
import imageCompression from "browser-image-compression";
import GoToDashboard from "../components/GoToDashboard";

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

function CreateProduct() {
  const { loading, error } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(0);
  const [keywords, setKeywords] = useState("");
  const [stock, setStock] = useState("");
  const [lowStock, setLowStock] = useState(3);
  const [category, setCategory] = useState("");
  const [optionGroups, setOptionGroups] = useState([]);
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setLowStock(3);
    setDescription("");
    setKeywords("");
    setCategory("");
    setDiscount(0);
    setOptionGroups([]);
    setImage([]);
    setImagePreview([]);
  };

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

  const createProductSubmit = async (e) => {
    e.preventDefault();
    if (image.length === 0) {
      toast.error(t("admin.products.imageRequired"), { position: "top-center", autoClose: 3000 });
      return;
    }

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

    try {
      await dispatch(createProduct({ name, price, description, keywords, stock, lowStock, category, discount, image, optionGroups: cleanedOptionGroups })).unwrap();
      toast.success(t("admin.products.created"), { position: "top-center", autoClose: 3000 });
      resetForm();
      navigate("/admin/products");
    } catch (submitError) {
      if (submitError?.message?.includes("Duplicate slug")) {
        toast.error(t("admin.products.duplicateProduct"), { position: "top-center", autoClose: 3000 });
      } else {
        toast.error(submitError?.message || t("admin.products.createFailed"), { position: "top-center", autoClose: 3000 });
      }
      dispatch(removeErrors());
    }
  };

  const createProductImage = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImage([]);
    setImagePreview([]);

    try {
      const processedImages = await compressFilesToBase64(files);
      setImage(processedImages);
      setImagePreview(processedImages);
    } catch {
      toast.error(t("user.updateProfile.avatarProcessFailed"), { position: "top-center", autoClose: 3000 });
    }
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

  useEffect(() => {
    if (error) {
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.products.createProduct")} />
      <div className="create-product-container">
        <h1 className="form-title">{t("admin.products.createProduct")}</h1>
        <form className="product-form" encType="multipart/form-data" onSubmit={createProductSubmit}>
          <input type="text" className="form-input" name="name" placeholder={t("admin.products.enterName")} required value={name} onChange={(e) => setName(e.target.value)} />
          <input type="number" className="form-input" name="price" placeholder={t("admin.products.enterPrice")} required value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="text" className="form-input" name="description" placeholder={t("admin.products.enterDescription")} required value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="text" className="form-input" name="keywords" placeholder={t("admin.products.productKeywords")} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <input type="text" className="form-input" name="category" placeholder={t("admin.products.category")} value={category} onChange={(e) => setCategory(e.target.value)} />
          <input type="number" className="form-input" name="discount" placeholder={t("admin.products.discountAmount")} value={discount} min="0" onChange={(e) => setDiscount(e.target.value)} />
          <input type="number" className="form-input" name="stock" placeholder={t("admin.products.enterStock")} required value={stock} onChange={(e) => setStock(e.target.value)} />
          <input type="number" className="form-input" name="lowStock" placeholder={t("admin.products.lowStockThreshold")} value={lowStock} min="0" onChange={(e) => setLowStock(e.target.value)} />

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
                          id={`option-images-${option.id}`}
                          accept="image/*"
                          className="form-input-file"
                          multiple
                          onChange={(e) => handleOptionImages(group.id, option.id, e.target.files)}
                        />
                        <label htmlFor={`option-images-${option.id}`} className="file-input-label">
                          {t("admin.products.chooseImages")}
                        </label>
                      </div>
                      {option.images.length > 0 && (
                        <div className="image-preview-container">
                          {option.images.map((img, index) => (
                            <img src={img} alt={t("admin.products.preview")} className="image-preview" key={index} />
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