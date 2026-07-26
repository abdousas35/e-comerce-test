import GoToDashboard from "../components/GoToDashboard";
import React, { useEffect } from "react";
import "../AdminStyles/UsersList.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import { Delete, Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { fetchUsers, removeErrors, deleteUser } from "../features/admin/adminSlice";
import GoToDashboard from "../components/GoToDashboard";


function UsersList() {
  const { users, loading, error } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(t("common.somethingWrong"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

  const handleDeleteUser = async (id) => {
    if (window.confirm(t("admin.users.deleteConfirm"))) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success(t("admin.users.deleted"), { position: "top-center", autoClose: 2500 });
        dispatch(fetchUsers());
      } catch {
        toast.error(t("admin.users.deleteFailed"), { position: "top-center", autoClose: 3000 });
      }
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <GoToDashboard />
          <Navbar />
          <PageTitle title={t("admin.users.allUsers")} />
          <div className="usersList-container">
            <h1 className="usersList-title">{t("admin.users.allUsers")}</h1>
            <div className="usersList-table-container">
              <table className="usersList-table">
                <thead>
                  <tr>
                    <th>{t("admin.common.no")}</th>
                    <th>{t("admin.common.name")}</th>
                    <th>{t("user.common.email")}</th>
                    <th>{t("admin.users.role")}</th>
                    <th>{t("admin.common.createdAt")}</th>
                    <th>{t("cart.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/user/${user._id}`} className="action-icon edit-icon"><Edit /></Link>
                        <button className="action-icon delete-icon" onClick={() => handleDeleteUser(user._id)}><Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default UsersList;
