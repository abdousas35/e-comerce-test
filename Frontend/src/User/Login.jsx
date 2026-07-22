import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import "../UserStyles/Form.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { login, removeErrors } from "../features/user/userSlice";
import { toast } from "react-toastify";

function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { error, isAuthenticated } = useSelector((state) => state.user);
  const { settings } = useSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);
  const hasHandledInitialAuth = useRef(false);
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(login({ email: loginEmail, password: loginPassword })).unwrap();
      toast.success(t("user.login.success"), { position: "top-center", autoClose: 3000 });
      navigate("/");
    } catch (submitError) {
      toast.error(submitError || t("user.login.failed"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (isAuthenticated && !hasHandledInitialAuth.current) {
      hasHandledInitialAuth.current = true;
      toast.success(t("user.login.alreadyLoggedIn"), { position: "top-center", autoClose: 3000 });
      navigate("/");
    }
  }, [isAuthenticated, navigate, t]);

  return (
    <>
      <Helmet>
        <title>{`Login - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`Sign in to ${settings?.storeName || "this store"} to manage orders, saved addresses, and account details securely.`}
        />
      </Helmet>
      <div className="form-container container">
      <div className="form-content">
        <form className="form" onSubmit={loginSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder={t("user.common.email")}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder={t("user.common.password")}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <button className="authBtn">{loading ? t("user.login.signingIn") : t("user.login.signIn")}</button>
          <p className="form-links">
            {t("user.login.forgot")} <Link to="/password/forgot">{t("user.login.resetHere")}</Link>
          </p>
          <p className="form-links">
            {t("user.login.noAccount")} <Link to="/register">{t("user.login.signUpHere")}</Link>
          </p>
        </form>
      </div>
    </div>
    </>
  );
}

export default Login;
