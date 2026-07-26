import React from "react";
import { Link } from "react-router-dom";
import "../componentStyles/GoToDashboard.css";
import { useTranslation } from "react-i18next";

const GoToDashboard = () => {
  const { t } = useTranslation();

  return (
    <Link to="/admin/dashboard" className="goto-dashboard-link" title={t("admin.backToDashboard")}>
      <div className="arrow-container">
        <div className="arrow-icon"></div>
      </div>
    </Link>
  );
};

export default GoToDashboard;
