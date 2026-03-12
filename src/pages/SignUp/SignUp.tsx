import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./style.css";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { username: "", email: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().min(3, "Min 3 characters").required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Min 6 characters").required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        await api.post("/api/auth/signup", values);
        navigate("/");
      } catch {
        setError("Registration failed");
      }
    },
  });

  return (
    <div className="signup-container">
      <h2 className="signup-title">ЗАРЕЄСТРУВАТИСЯ</h2>

      <form onSubmit={formik.handleSubmit}>
        <div>
          <input
            className="signup-input"
            name="username"
            placeholder="логін"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
          {formik.errors.username && formik.touched.username && (
            <div style={{ color: "red" }}>{formik.errors.username}</div>
          )}
        </div>

        <div>
          <input
            name="email"
            className="signup-input"
            placeholder="e-mail"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
        </div>

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="пароль"
            className="signup-input"
            onChange={formik.handleChange}
            value={formik.values.password}
          />

          <button
            className="show-password-button"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {formik.errors.password && formik.touched.password && (
          <div style={{ color: "red" }}>{formik.errors.password}</div>
        )}

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button
          type="submit"
          className="signup-button"
          style={{ marginTop: 10 }}
        >
          ВПЕРЕД
        </button>
      </form>
    </div>
  );
};

export default SignUp;
