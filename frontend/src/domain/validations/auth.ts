import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Họ và tên là bắt buộc")
      .min(2, "Họ và tên tối thiểu 2 ký tự")
      .max(100, "Họ và tên không được vượt quá 100 ký tự"),
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu cần ít nhất 6 ký tự")
      .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
    phoneNumber: z
      .string()
      .max(20, "Số điện thoại không được vượt quá 20 ký tự")
      .optional()
      .or(z.literal("")),
    terms: z.boolean().refine((val) => val === true, {
      message: "Bạn cần đồng ý với điều khoản",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
