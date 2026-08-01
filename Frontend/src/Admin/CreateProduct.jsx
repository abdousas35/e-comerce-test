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
import axios from "axios";

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyGroup = () => ({
  id: generateId(),
  name: "",
  values: [""],
});

const createEmptyCombination = () => ({
  id: generateId(),
  selections: [],
  price: "",
  stock: "",
  images: [],
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
  const [combinations, setCombinations] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    axios.get("/api/v1/sections")
      .then((res) => setAvailableSections(res.data.sections || []))
      .catch(() => setAvailableSections([]));
  }, []);

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
    setCombinations([]);
    setSelectedSections([]);
    setImage([]);
    setImagePreview([]);
  };

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

    try {
      await dispatch(createProduct({ name, price, description, keywords, stock, lowStock, category, discount, image, optionGroups: cleanedOptionGroups, combinations: cleanedCombinations, sections: selectedSections })).unwrap();
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
    const existingSelections = new Set(combinations.map((combo) => JSON.stringify(combo.selections.sort((a, b) => a.groupName.localeCompare(b.groupName) + a.value.localeCompare(b.value)))));

    const nextCombinations = generated
      .map((selections) => {
        const normalizedSelections = selections.map((selection) => ({ ...selection }));
        const key = JSON.stringify(normalizedSelections.sort((a, b) => a.groupName.localeCompare(b.groupName) + a.value.localeCompare(b.value)));
        if (existingSelections.has(key)) {
          return null;
        }
        return { id: generateId(), selections: normalizedSelections, price: "", stock: "", images: [] };
      })
      .filter(Boolean);

    setCombinations((current) => {
      const preserved = current.filter((combo) => {
        const comboKey = JSON.stringify((combo.selections || []).slice().sort((a, b) => a.groupName.localeCompare(b.groupName) + a.value.localeCompare(b.value)));
        return generated.some((selectionList) => {
          const generatedKey = JSON.stringify(selectionList.sort((a, b) => a.groupName.localeCompare(b.groupName) + a.value.localeCompare(b.value)));
          return comboKey === generatedKey;
        });
      });
      return [...preserved, ...nextCombinations];
    });
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
                        <input type="file" id={`combo-images-${combo.id}`} accept="image/*" className="form-input-file" multiple onChange={(e) => handleCombinationImages(combo.id, e.target.files)} />
                        <label htmlFor={`combo-images-${combo.id}`} className="file-input-label">{t("admin.products.chooseImages")}</label>
                      </div>
                      {combo.images.length > 0 ? (
                        <div className="image-preview-container">
                          {combo.images.map((img, index) => (<img src={img} alt={t("admin.products.preview")} className="image-preview" key={`${combo.id}-${index}`} />))}
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