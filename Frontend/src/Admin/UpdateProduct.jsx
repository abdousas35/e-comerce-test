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
import axios from "axios";

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyGroup = () => ({
  id: generateId(),
  name: "",
  values: [""],
});

const mapProductOptionGroups = (optionGroups = []) =>
  optionGroups.map((group) => ({
    id: group._id || generateId(),
    name: group.name || "",
    values: Array.isArray(group.values) ? group.values : [],
  }));

const mapProductCombinations = (combinations = []) =>
  combinations.map((combo) => ({
    id: combo._id || generateId(),
    selections: Array.isArray(combo.selections) ? combo.selections : [],
    price: combo.price ?? "",
    stock: combo.stock ?? "",
    images: combo.images || [],
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
  const [combinations, setCombinations] = useState(() => mapProductCombinations(product.combinations));
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState(() => (
    (product.sections || []).map((section) => (typeof section === "string" ? section : section._id))
  ));
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [oldImages, setOldImages] = useState(product.image || []);

  useEffect(() => {
    axios.get("/api/v1/sections")
      .then((res) => setAvailableSections(res.data.sections || []))
      .catch(() => setAvailableSections([]));
  }, []);

  const toggleSection = (sectionId) => {
    setSelectedSections((current) => (
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    ));
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

  const addValue = (groupId) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, values: [...group.values, ""] } : group
    )));
  };

  const removeValue = (groupId, valueIndex) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, values: group.values.filter((_, index) => index !== valueIndex) } : group
    )));
  };

  const updateValue = (groupId, valueIndex, newValue) => {
    setOptionGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, values: group.values.map((value, index) => (index === valueIndex ? newValue : value)) } : group
    )));
  };

  const generateCombinations = () => {
    const validGroups = optionGroups.filter((group) => group.name.trim() && group.values.some((value) => value.trim()));
    if (validGroups.length === 0) return;

    const build = (index, currentSelections) => {
      if (index === validGroups.length) {
        return [currentSelections];
      }

      const group = validGroups[index];
      return group.values
        .filter((value) => value.trim())
        .flatMap((value) => build(index + 1, [...currentSelections, { groupName: group.name, value }]));
    };

    const generated = build(0, []);
    const nextCombinations = generated.map((selections) => ({
      id: generateId(),
      selections,
      price: "",
      stock: "",
      images: [],
    }));

    setCombinations(nextCombinations);
  };

  const updateCombinationField = (comboId, field, value) => {
    setCombinations((current) => current.map((combo) => (combo.id === comboId ? { ...combo, [field]: value } : combo)));
  };

  const handleCombinationImages = async (comboId, files) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;
    try {
      const processedImages = await compressFilesToBase64(fileList);
      updateCombinationField(comboId, "images", processedImages);
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
        values: group.values.filter((value) => value.trim() !== ""),
      }))
      .filter((group) => group.values.length > 0);

    const cleanedCombinations = combinations
      .filter((combo) => combo.selections.length > 0)
      .map((combo) => ({
        selections: combo.selections,
        price: combo.price,
        stock: combo.stock,
        images: combo.images,
      }));

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
      combinations: cleanedCombinations,
      sections: selectedSections,
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

              <div className="variant-row option-row">
                {group.values.map((value, index) => (
                  <div key={`${group.id}-${index}`} className="option-value-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder={group.name ? `${group.name} ${index + 1}` : t("admin.products.optionValuePlaceholder")}
                      value={value}
                      onChange={(e) => updateValue(group.id, index, e.target.value)}
                    />
                    {group.values.length > 1 ? (
                      <button type="button" className="submit-btn" onClick={() => removeValue(group.id, index)}>
                        {t("admin.products.removeVariant")}
                      </button>
                    ) : null}
                  </div>
                ))}
                <button type="button" className="submit-btn" onClick={() => addValue(group.id)}>
                  {t("admin.products.addOption")}
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="submit-btn" onClick={addGroup}>
            {t("admin.products.addGroup")}
          </button>
          <button type="button" className="submit-btn" onClick={generateCombinations}>
            Generate combinations
          </button>
        </div>

        {combinations.length > 0 ? (
          <div className="variant-editor">
            <h3>Combinations</h3>
            {combinations.map((combo) => (
              <div key={combo.id} className="option-group-card">
                <div className="option-group-header">
                  <strong>{combo.selections.map((selection) => `${selection.groupName}: ${selection.value}`).join(" / ")}</strong>
                </div>
                <div className="variant-row option-row">
                  <input type="number" className="form-input" placeholder={t("admin.products.variantPrice")} value={combo.price} onChange={(e) => updateCombinationField(combo.id, "price", e.target.value)} />
                  <input type="number" className="form-input" placeholder={t("admin.products.variantStock")} value={combo.stock} onChange={(e) => updateCombinationField(combo.id, "stock", e.target.value)} />
                  <div className="file-input-container option-image-input">
                    <div className="file-input-wrapper">
                      <input type="file" id={`update-combo-images-${combo.id}`} accept="image/*" className="form-input-file" multiple onChange={(e) => handleCombinationImages(combo.id, e.target.files)} />
                      <label htmlFor={`update-combo-images-${combo.id}`} className="file-input-label">{t("admin.products.chooseImages")}</label>
                    </div>
                    {combo.images.length > 0 ? (
                      <div className="image-preview-container">
                        {combo.images.map((img, index) => (<img src={typeof img === "string" ? img : img.url} alt={t("admin.products.preview")} className="image-preview" key={`${combo.id}-${index}`} />))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="variant-editor">
          <h3>{t("admin.products.productSections")}</h3>
          <p className="sections-hint">{t("admin.products.selectSections")}</p>

          {availableSections.length === 0 ? (
            <p className="sections-hint">{t("admin.products.noSectionsAvailable")}</p>
          ) : (
            <div className="section-checkbox-list">
              {availableSections.map((section) => (
                <label key={section._id} className="section-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section._id)}
                    onChange={() => toggleSection(section._id)}
                  />
                  {section.name}
                </label>
              ))}
            </div>
          )}
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
