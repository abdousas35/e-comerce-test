import React, { useEffect, useState } from "react";
import { Category, DeleteOutline, Save, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import GoToDashboard from "../components/GoToDashboard";
import {
  fetchSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  removeErrors,
} from "../features/admin/adminSlice";
import "../AdminStyles/CouponsManager.css";
import "../AdminStyles/SectionManager.css";

function SectionManager() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { sections, loading, error } = useSelector((state) => state.admin);
  const [name, setName] = useState("");

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const handleCreate = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    dispatch(createSection({ name: name.trim() }))
      .unwrap()
      .then(() => {
        toast.success(t("template.sections.created"), { position: "top-center", autoClose: 2500 });
        setName("");
      })
      .catch(() => {});
  };

  const handleToggleActive = (section) => {
    dispatch(updateSection({ id: section._id, isActive: !section.isActive }));
  };

  const handleDelete = (section) => {
    const confirmed = window.confirm(t("template.sections.deleteConfirm", { name: section.name }));
    if (!confirmed) return;

    dispatch(deleteSection(section._id))
      .unwrap()
      .then((result) => {
        toast.success(
          result?.affectedProductsCount
            ? t("template.sections.deletedWithProducts", { count: result.affectedProductsCount })
            : t("template.sections.deleted"),
          { position: "top-center", autoClose: 2500 }
        );
      })
      .catch(() => {});
  };

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    dispatch(reorderSections(reordered.map((section) => section._id)));
  };

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("template.sections.pageTitle")} />

      <div className="coupons-shell">
        <AdminSidebar />

        <main className="coupons-main">
          <div className="coupons-header">
            <div>
              <h1>{t("template.sections.pageTitle")}</h1>
              <p>{t("template.sections.headerDesc")}</p>
            </div>
          </div>

          <section className="coupons-card">
            <div className="coupons-section-title">
              <Category />
              <div>
                <h2>{t("template.sections.createSection")}</h2>
                <p>{t("template.sections.createDesc")}</p>
              </div>
            </div>

            <form className="section-create-form" onSubmit={handleCreate}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("template.sections.namePlaceholder")}
              />
              <button type="submit" className="coupons-save-btn" disabled={loading}>
                <Save fontSize="small" />
                {loading ? t("template.common.saving") : t("template.sections.addSection")}
              </button>
            </form>
          </section>

          <section className="coupons-card">
            <h2>{t("template.sections.allSections")}</h2>
            <div className="coupons-list">
              {sections.length === 0 ? (
                <p className="section-empty">{t("template.sections.noSections")}</p>
              ) : (
                sections.map((section, index) => (
                  <article key={section._id} className="coupon-item section-item">
                    <div className="section-reorder-controls">
                      <button
                        type="button"
                        className="section-reorder-btn"
                        onClick={() => moveSection(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${section.name} up`}
                      >
                        <ArrowUpward fontSize="small" />
                      </button>
                      <button
                        type="button"
                        className="section-reorder-btn"
                        onClick={() => moveSection(index, 1)}
                        disabled={index === sections.length - 1}
                        aria-label={`Move ${section.name} down`}
                      >
                        <ArrowDownward fontSize="small" />
                      </button>
                    </div>

                    <div className="section-item-info">
                      <strong>{section.name}</strong>
                      <span>/{section.slug}</span>
                    </div>

                    <label className="section-active-toggle">
                      <input
                        type="checkbox"
                        checked={section.isActive}
                        onChange={() => handleToggleActive(section)}
                      />
                      {section.isActive ? t("template.sections.active") : t("template.sections.inactive")}
                    </label>

                    <button type="button" className="coupon-delete-btn" onClick={() => handleDelete(section)}>
                      <DeleteOutline fontSize="small" />
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default SectionManager;
