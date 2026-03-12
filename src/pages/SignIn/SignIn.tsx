import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { signIn } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import "./style.css";

const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Min 6 characters").required("Required"),
    }),
    onSubmit: (values) => {
      dispatch(signIn(values));
    },
  });
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/"); // переходимо на Main після логіну
    }
  }, [user, navigate]);

  return (
    <div className="signin-container">
      <h2 className="signin-title">ВХІД</h2>
      <form onSubmit={formik.handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="signin-input"
            type="email"
            name="email"
            placeholder="e-mail"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
          {formik.errors.email && formik.touched.email && (
            <div style={{ color: "red" }}>{formik.errors.email}</div>
          )}
        </div>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="signin-input"
            type="password"
            name="password"
            placeholder="пароль"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
          {formik.errors.password && formik.touched.password && (
            <div style={{ color: "red" }}>{formik.errors.password}</div>
          )}
        </div>
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <button
          className="signin-button"
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px" }}
        >
          {loading ? "Завантаження..." : "УВІЙТИ"}
        </button>
      </form>
      <div className="signup-link">
        <Link to="/signup">Зареєструватися</Link>
      </div>
    </div>
  );
};

export default SignIn;
