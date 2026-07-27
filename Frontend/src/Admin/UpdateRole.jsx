import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import Loader from "../components/Loader";
import "../AdminStyles/UpdateRole.css";
import GoToDashboard from "../components/GoToDashboard";

import { getSingleUser, updateUserRole } from "../features/admin/adminSlice";

function UpdateRole() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, loading } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const { name, email, role } = formData;

  // جلب بيانات المستخدم عند دخول الصفحة
  useEffect(() => {
    if (id) {
      dispatch(getSingleUser(id));
    }
  }, [dispatch, id]);

  // تحديث الفورم عند تغير الـ user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      toast.warn(t("admin.users.selectRole"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      await dispatch(updateUserRole({ id, role })).unwrap();
      toast.success(t("admin.users.roleUpdated"), {
        position: "top-center",
        autoClose: 3000,
      });
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(t("common.somethingWrong"), {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.users.updateRole")} />
      <div className="page-wrapper">
        <div className="update-user-role-container">
          <h1>{t("admin.users.updateRole")}</h1>
          <form className="update-user-role-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("admin.common.name")}</label>
              <input type="text" readOnly value={name} />
            </div>

            <div className="form-group">
              <label>{t("user.common.email")}</label>
              <input type="email" readOnly value={email} />
            </div>

            <div className="form-group">
              <label>{t("admin.users.role")}</label>
              <select name="role" value={role} onChange={handleChange}>
                <option value="">{t("admin.users.selectRoleOption")}</option>
                <option value="user">{t("admin.users.user")}</option>
                <option value="admin">{t("admin.users.admin")}</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              {t("admin.users.updateRole")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default UpdateRole;
