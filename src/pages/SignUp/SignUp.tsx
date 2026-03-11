import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

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
        navigate("/signin");
      } catch {
        setError("Registration failed");
      }
    },
  });

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Sign Up</h2>

      <form onSubmit={formik.handleSubmit}>
        <div>
          <label>Username</label>
          <input
            name="username"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
          {formik.errors.username && formik.touched.username && (
            <div style={{ color: "red" }}>{formik.errors.username}</div>
          )}
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: 32,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {formik.errors.password && formik.touched.password && (
          <div style={{ color: "red" }}>{formik.errors.password}</div>
        )}

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit" style={{ marginTop: 10 }}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
